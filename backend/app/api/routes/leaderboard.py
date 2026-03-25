"""
Leaderboard API routes.

GET /api/v1/leaderboard - Get top traders leaderboard
GET /api/v1/leaderboard/categories - Get leaderboard categories
"""
import asyncio
import json
from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from decimal import Decimal

from app.services.data import DataClient, get_data_client
from app.services.gamma import GammaClient, get_gamma_client
from app.services.scoring_service import get_address_scores
from app.core.redis import get_redis

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])

# Cache TTL in seconds
LEADERBOARD_CACHE_TTL = 300  # 5 minutes
TOP_LEADERBOARD_CACHE_TTL = 60  # 1 minute for top 200


@router.get("/")
async def get_leaderboard(
    category: Optional[str] = None,
    time_period: Optional[str] = Query(None, description="e.g., 'daily', 'weekly', 'monthly', 'all'"),
    limit: int = Query(200, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    """
    Get Polymarket leaderboard with calculated scores.

    Returns top traders ranked by composite score.
    Results are cached in Redis for fast access.
    """
    redis = get_redis()

    # Try cache first for top 200
    cache_key = f"leaderboard:top200"
    if limit <= 200 and offset == 0:
        cached = redis.get(cache_key)
        if cached:
            entries = json.loads(cached)
            return {
                "entries": entries[:limit],
                "total_count": len(entries),
                "cached": True,
                "cache_ttl": TOP_LEADERBOARD_CACHE_TTL,
            }

    # Fetch from Polymarket API
    data_client = get_data_client()
    raw_leaderboard = await data_client.get_leaderboard(
        category=category,
        time_period=time_period,
        limit=min(limit * 2, 500),  # Fetch extra for scoring
    )

    # Calculate scores for each entry
    scored_entries = []

    for entry in raw_leaderboard:
        address = entry.get("address", "")
        if not address:
            continue

        # Get positions and trades for scoring
        positions, closed_positions, trades = await asyncio.gather(
            data_client.get_positions(user=address),
            data_client.get_closed_positions(user=address),
            data_client.get_trades(user=address),
        )

        scores = get_address_scores(address, positions, closed_positions, trades)

        scored_entries.append({
            "rank": entry.get("rank", 0),
            "address": address.lower(),
            "score": scores.total_score,
            "data_quality": scores.data_quality,
            "win_rate": scores.win_rate,
            "profit_factor": scores.profit_factor,
            "total_trades": len(trades),
            "dimensions": scores.to_dict()["dimensions"],
            # Additional data from leaderboard
            "volume": entry.get("volume"),
            "category": entry.get("category"),
        })

    # Sort by score descending
    scored_entries.sort(key=lambda x: x["score"], reverse=True)

    # Re-rank after scoring
    for i, entry in enumerate(scored_entries):
        entry["rank"] = i + 1

    # Cache top 200
    if len(scored_entries) >= 200:
        redis.set(
            cache_key,
            json.dumps(scored_entries[:200]),
            ex=TOP_LEADERBOARD_CACHE_TTL,
        )

    return {
        "entries": scored_entries[offset:offset + limit],
        "total_count": len(scored_entries),
        "cached": False,
        "category": category,
        "time_period": time_period,
    }


@router.get("/top")
async def get_top_traders(
    limit: int = Query(50, ge=1, le=200),
):
    """
    Get top N traders - optimized endpoint for quick access.

    Uses shorter cache TTL for fresher data.
    """
    return await get_leaderboard(limit=limit, offset=0)


@router.get("/categories")
async def get_leaderboard_categories():
    """
    Get available leaderboard categories.
    """
    return {
        "categories": [
            {"id": "all", "name": "All Time"},
            {"id": "daily", "name": "Daily"},
            {"id": "weekly", "name": "Weekly"},
            {"id": "monthly", "name": "Monthly"},
        ]
    }


@router.get("/trader/{address}")
async def get_trader_on_leaderboard(
    address: str,
    category: Optional[str] = None,
):
    """
    Find a specific trader's position on the leaderboard.
    """
    redis = get_redis()

    # Check if leaderboard is cached
    cache_key = f"leaderboard:top200"
    cached = redis.get(cache_key)

    if cached:
        entries = json.loads(cached)
        for entry in entries:
            if entry["address"].lower() == address.lower():
                return {
                    "found": True,
                    "entry": entry,
                }
        return {"found": False, "address": address.lower()}

    # Fetch fresh data
    result = await get_leaderboard(limit=200, offset=0)

    for entry in result["entries"]:
        if entry["address"].lower() == address.lower():
            return {
                "found": True,
                "entry": entry,
            }

    return {"found": False, "address": address.lower()}
