<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# SyntiqHQ project rules (read before ANY change)

1. **Before making any update, read [`docs/PROJECT_BRIEF.md`](docs/PROJECT_BRIEF.md)** — the master brief for SyntiqHQ. Start with **Section 0 (Current Focus)**.
2. **Backend first.** This repo is the SyntiqHQ backend. Do not build frontend/UI (admin pages, public review UI, styling, marketing site) unless the user explicitly asks.
3. **Work in small chunks.** Do one backend chunk at a time (see Section 0 ordering), verify it, then stop and report.
4. **Inspect before writing.** Check the current state of `prisma/schema.prisma`, the Prisma config, `src/`, and `package.json` before changing anything. Preserve useful existing code.
5. **Prisma 7 conventions only** (`prisma-client` generator, URL in Prisma config, `@prisma/adapter-pg`). See brief Sections 37–38.
6. **Do not overbuild** (brief Section 67) and **never fabricate business data** (clients, testimonials, metrics).
7. **Always respect suppression:** no outreach may ever be sent to an email in the `Suppression` table.
8. If a change conflicts with the brief, call it out before implementing.
9. **Human-readable code first.** Write code a developer can read top to bottom without explanation:
   - Small files with plain, descriptive names. One clear job per file.
   - Simple code over clever code. No unnecessary abstractions, wrappers, config constants, or generic helpers.
   - Comments only when something isn't obvious from the code. No AI-style commentary, banners, or JSDoc on self-explanatory functions.
   - Don't create a file unless it's genuinely needed; if a helper is used once, keep it inline.
10. **API route style** (see `src/app/api/auth/login/route.ts` as the reference):
    - Start every route function with two comment lines: what it does, then the method and URL (with query params for list routes), e.g.
      ```ts
      // This route updates a company's details
      // PATCH /api/admin/companies/:id
      ```
    - Use `NextRequest` / `NextResponse` from `next/server`.
    - For dynamic routes, type params inline — no separate `type RouteParams`:
      `export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> })`
    - Admin routes start by calling `getCurrentUser()` and returning a 401 if there's no user.
    - Wrap every handler body in `try/catch`. In `catch`, `console.error` the error and return a 500.
    - Validate input with a zod schema at the top of the route file (move it to a shared file only when reused).
    - Error responses are always `{ error: "Short label", message: "Human-readable sentence." }` with the right status code.
    - Success responses return plain data, e.g. `{ user: {...} }` — no `{ success: true, data }` wrapper.
    - Do **not** call `prisma.$disconnect()` in routes; the shared client in `src/lib/prisma.ts` manages connections.
11. **API reference: [`docs/API.md`](docs/API.md).** It lists every endpoint with its inputs, outputs and side effects.
    - Read it before building any frontend screen, and use its coverage checklist so every endpoint gets used.
    - When you add or change an endpoint, update `docs/API.md` in the same change.
