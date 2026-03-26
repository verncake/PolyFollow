# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is the **main documentation hub** for the Polymarket Follow-Alpha System. This repository contains only documentation (README.md, TODO_LIST.md, PROJECT_PROMOT_PHASE1-2.md) and **does NOT contain source code**.

## Multi-Repository Structure

This project uses a **3-repository architecture**:

| Repository | URL | Purpose |
|------------|-----|---------|
| PolyFollow | https://github.com/verncake/PolyFollow | Main repo - Documentation only |
| PolyFollow-Backend | https://github.com/verncake/PolyFollow-Backend | FastAPI backend - All backend code |
| PolyFollow-Frontend | https://github.com/verncake/PolyFollow-Frontend | Next.js frontend - All frontend code |

### Which repository to work in?

- **DO NOT** commit code to this repository (PolyFollow)
- **Backend development**: Work in PolyFollow-Backend
- **Frontend development**: Work in PolyFollow-Frontend
- **Documentation/tracking**: Work in PolyFollow

## Collaboration Workflow

### Before Starting Work

1. **Identify the correct repository** based on what you're working on
2. **Check the current branch**: Always work on feature branches, never directly on main
3. **Pull latest changes**: `git pull origin main` before starting new work

### Code Submission Process

1. **Create a feature branch**:
   ```bash
   git checkout -b feat/your-feature-name
   # or
   git checkout -b fix/issue-description
   ```

2. **Make your changes** and commit with clear messages:
   ```bash
   git commit -m "feat: add new feature description"
   git commit -m "fix: resolve specific issue"
   git commit -m "docs: update documentation"
   ```

3. **Push to remote**:
   ```bash
   git push -u origin feat/your-feature-name
   ```

4. **Create a Pull Request** via GitHub UI

### Commit Message Convention

Use conventional commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation only
- `refactor:` - Code refactoring
- `test:` - Adding/updating tests
- `chore:` - Maintenance tasks

### Review Process

1. **Self-review** before requesting review:
   - Run tests: `pytest tests/ -v` (backend) or `npm test` (frontend)
   - Check for linting errors
   - Verify no sensitive data in commits

2. **PR Description Requirements**:
   - Summary of changes
   - Test plan (how to verify the change works)
   - Screenshots for UI changes

3. **Reviewer Checklist**:
   - Code quality and style
   - Test coverage
   - No security issues (secrets, credentials)
   - Documentation updated if needed

## Project Background

### What is Polymarket Follow-Alpha?

A Web3 automation platform that:
- Tracks Polymarket traders' positions and performance
- Calculates 10-dimensional scores for traders
- Provides a leaderboard of top performers
- Enables users to automatically copy trades from top traders

### Tech Stack

**Backend**: Python 3.14 + FastAPI + httpx + SQLAlchemy 2.0 + asyncpg
**Frontend**: Next.js 14 + Tailwind CSS + Shadcn UI + React Query
**Data**: Supabase (PostgreSQL) + Upstash Redis

## Key Files in This Repository

- `README.md` - Project overview and quick start guide
- `TODO_LIST.md` - Development progress tracking
- `PROJECT_PROMOT_PHASE1-2.md` - Development guide for Phase 1 & 2
- `10_DIMENSIONAL_ASSESSMENT.md` - Scoring system documentation

## Getting Help

- [Polymarket API Docs](https://docs.polymarket.com)
- [Polymarket CLOB SDK](https://github.com/Polymarket/py-clob-client)
- [Supabase Docs](https://supabase.com/docs)
- [Upstash Redis Docs](https://upstash.com/docs)
