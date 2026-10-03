# SyntiqHQ Server

Backend for **SyntiqHQ**, a digital product agency: an internal CRM and admin system that turns prospect research into personalized reviews and outreach, then tracks follow-ups, proposals and deals.

> **Read [`docs/PROJECT_BRIEF.md`](docs/PROJECT_BRIEF.md) before making any change.** It is the source of truth for scope, data model and build order. AI agents get the same instruction in [`AGENTS.md`](AGENTS.md).
>
> **Building the frontend? Read [`docs/API.md`](docs/API.md).** It lists every endpoint, what it expects and returns, and which screen should use it.

## Current focus

**Backend first. No frontend for now.** We build in small chunks:

1. Foundation: Prisma 7 + PostgreSQL schema, migrations, client (done)
2. Auth: users, password hashing, sessions, route protection (done)
3. Companies / Contacts / Leads (done)
4. Reviews / ReviewPoints (private token URLs, publish, expiry, view count) (done)
5. Outreach tracking (done)
6. Suppression / unsubscribe (done)
7. Tasks (done)
8. Proposals / Deals (done)
9. Dashboard queries (done)
10. Hardening (done)

## Stack

- Next.js (App Router), TypeScript
- PostgreSQL
- Prisma ORM 7 (`prisma-client` generator, `@prisma/adapter-pg`)

## Getting started

```bash
npm install
# set DATABASE_URL in .env
npx prisma generate
npm run dev
```
