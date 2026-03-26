# gt-engine-irl

A full-stack decision analysis platform powered by Game Theory models and LLM integration.

Users describe a real-life situation in natural language. The platform structures it into a mathematical model, scores strategic parameters, and recommends the next best move — tracking how the situation evolves over time.

→ Live: https://nextmove.gt

---

## Why I built this

Most AI tools give you advice and forget it. This platform builds a persistent mathematical model from your situation, tracks how it changes with each update, and explains *why* a move is strategically sound — not just *what* to do.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite |
| Backend | Python 3.13, FastAPI, Pydantic |
| Database | PostgreSQL 14, Alembic migrations |
| LLM | Groq API (llama-3.3-70b-versatile) |
| Analytics | PostHog |
| Rate Limiting | slowapi |

---

## Architecture
```
gt-engine-irl/
├── frontend/
│   └── src/             # 11 screens, component library, API layer
├── backend/
│   ├── api/             # FastAPI routes, schemas, auth, rate limiting
│   ├── db/              # PostgreSQL models, Alembic migrations
│   ├── engine/          # Core GT engine (Utility-Cost model)
│   └── services/        # Game session management
```

**Planned (post-deployment):**
- dbt for data transformation
- Apache Airflow for pipeline orchestration
- Docker for containerization

---

## Core Engine

The platform implements a **Utility-Cost model** — a game-theoretic framework that quantifies a user's strategic position as a ratio of weighted utility parameters to weighted cost parameters (Position Value). As the user takes actions and reports outcomes, the model rescores parameters and tracks phase progression over time.

---

## Key Technical Decisions

- **LLM as parameter extractor** — rather than hardcoded inputs, the LLM dynamically identifies relevant strategic parameters from natural language and scores them
- **Persistent session model** — full update history and stage progression stored per session, enabling longitudinal analysis
- **Anonymous auth** — 8-character code based, no email required, reducing friction for B2C users
- **Rate limiting per endpoint** — slowapi, IP-based, preventing LLM API abuse

---

## Status

`v0.1.0` — live and functional. Relationship analysis scenario implemented end-to-end.

Actively extending GT model coverage and scenario types.

PRs and feedback welcome — especially around extending the engine with new GT models (Nash equilibrium, Stackelberg, repeated games).

Contact: onurizmitlioglu@gmail.com