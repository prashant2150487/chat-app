# Local development

## Backend (`services/server`)

All HTTP and Socket.IO traffic uses one app (default **port 8000**).

| Area | Path |
|------|------|
| Health | `GET /api/v1/health` |
| Auth | `/api/v1/auth/*` |
| Users & profile | `/api/v1/users/*` |
| Contacts | `/api/v1/contacts/*` |
| Blocks | `/api/v1/blocks/*` |
| Realtime | Socket.IO at `/socket.io` (JWT in `auth.token`) |

### Setup

```bash
cd services/server
cp .env.example .env
npm install
npm run db:generate
npm run db:push
```

### Run

From repo root:

```bash
npm run dev
```

Starts **server** + **web** (`NEXT_PUBLIC_API_URL=http://localhost:8000`).

Optional: `npm run desktop` for the Electron shell in `app/desktop`.

```bash
cd services/server
npm run test:socket
npm run test:smtp
```

## Chat (plan)

See [docs/chat-architecture.md](./docs/chat-architecture.md) for REST + WebSocket design, events, and implementation order.
