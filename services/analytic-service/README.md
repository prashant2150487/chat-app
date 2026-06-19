# Analytics Service

FastAPI microservice that exposes analytics/metrics over the shared `chat_db`
MySQL database (the same database used by `auth-service`).

## Tech stack

- FastAPI
- SQLAlchemy 2.x + PyMySQL
- Pydantic Settings

## Setup

```powershell
# From services/analytic-service/
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Copy `.env.example` to `.env` and adjust `DATABASE_URL` if needed.

## Run

```powershell
venv\Scripts\activate
uvicorn app.main:app --reload --port 5002
```

- Swagger UI: http://127.0.0.1:5002/docs
- Health: http://127.0.0.1:5002/

## Endpoints

| Method | Path                          | Description                       |
| ------ | ----------------------------- | --------------------------------- |
| GET    | `/`                           | Health check                      |
| GET    | `/api/v1/analytics/users`     | User metrics (totals, verified)   |
| GET    | `/api/v1/analytics/messages`  | Message metrics                   |
| GET    | `/api/v1/analytics/groups`    | Group metrics                     |

> `messages` and `groups` return zeroed metrics until the corresponding
> tables exist in `chat_db`.

## Project structure

```text
app/
├── main.py              # FastAPI app + router registration
├── core/                # config + database engine/session
├── api/v1/endpoints/    # HTTP endpoints
├── models/              # SQLAlchemy ORM models
├── schemas/             # Pydantic response models
└── services/            # business logic / queries
```
