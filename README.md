# Taskflow

A personal task manager built with Next.js App Router, TypeScript, Tailwind CSS, Better Auth, Prisma, SQLite, and Zod.

## Features

- Email/password registration, login, logout, hashed credentials, and Better Auth sessions.
- Authenticated dashboard with create, edit, complete, and delete task operations.
- Server-side Zod validation and ownership checks on every task mutation.
- SQLite persistence and a versioned Prisma migration.

## Project structure

```text
src/app/                 Pages, route handler, and server actions
src/components/          Client-side auth and task UI
src/lib/                 Better Auth and Prisma clients
prisma/schema.prisma     Database schema
prisma/migrations/       Applied Prisma migrations
prisma.config.ts         Prisma 7 configuration
```

## Install and run

1. Install Node.js 20.19+ (Node 22 or 24 is recommended), then install dependencies:

   ```bash
   npm install
   ```

2. Copy the example environment file and set a unique secret with at least 32 characters:

   ```powershell
   Copy-Item .env.example .env
   ```

3. Create/update the SQLite database and generated client:

   ```bash
   npm run db:migrate -- --name init
   npm run db:generate
   ```

4. Start the application:

   ```bash
   npm run dev
   ```

Open http://localhost:3000. Register a new account, then create tasks from the dashboard.

## Validation commands

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Environment variables

`DATABASE_URL` is a local SQLite connection string, normally `file:./dev.db`.

`BETTER_AUTH_SECRET` must be a high-entropy value of at least 32 characters and must never be committed. `BETTER_AUTH_URL` is the application base URL, such as `http://localhost:3000` during local development.
