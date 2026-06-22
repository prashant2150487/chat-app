# User Service

Microservice for user profiles, contacts and blocking. Built with Express +
Prisma (PostgreSQL), following the same layered architecture as `auth-service`.

## Folder structure

```text
user-service/
├── server.js                # entrypoint: load env, connect DB, start server
├── app.js                   # express app + global middleware
├── config/
│   ├── env.js               # typed access to environment variables
│   └── database.js          # Prisma client + connectDB
├── routes/
│   ├── index.js             # root router (mounts feature routers) + /health
│   └── userRoutes.js        # /users routes
├── controllers/
│   └── userController.js     # request/response handling only
├── services/
│   └── userService.js        # business logic
├── middlewares/
│   ├── errorMiddleware.js    # central error handler
│   └── notFoundMiddleware.js # 404 handler
├── utils/
│   ├── appError.js           # operational error class
│   └── asyncHandler.js       # async wrapper -> forwards errors to middleware
├── constants/
│   ├── httpStatus.js
│   └── errorMessage.js
└── prisma/
    └── schema.prisma         # users / contacts / blocked_users models
```

## Setup

```powershell
# From services/user-service/
npm install
npx prisma generate
```

Copy `.env.example` to `.env` and set `DATABASE_URL` (PostgreSQL).

## Run

```powershell
npm run dev      # nodemon
# or
npm start
```

- Health: http://127.0.0.1:5003/api/v1/health
- Demo:   http://127.0.0.1:5003/api/v1/users/123

> The demo endpoint returns sample data from the service layer and does not
> require a live database. `connectDB` warns (instead of exiting) if Postgres
> is unreachable, so the scaffold boots immediately.

## Database

Once PostgreSQL is running and `DATABASE_URL` is set, create the tables:

```powershell
npm run db:migrate -- --name init
```

The schema models the three tables: `users`, `contacts`, `blocked_users`.

## Adding a real feature

1. Add a model query in `services/` (use `prisma` from `config/database.js`).
2. Add a thin handler in `controllers/` (wrapped in `asyncHandler`).
3. Register the route in `routes/`.
```
