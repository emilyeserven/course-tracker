# Course Tracker (emstack)

Full-stack TypeScript monorepo for tracking online courses, learning topics, daily habits, and tasks.

## Quick start

See [`CLAUDE.md`](./CLAUDE.md) for full setup, architecture, and contributor workflows. The short version:

```bash
pnpm install
docker compose up --wait db
cp packages/middleware/.env.example packages/middleware/.env
pnpm --filter=@emstack/middleware push:dev
pnpm dev
```

Client runs at http://localhost:5173, middleware at http://localhost:3001, OpenAPI docs at http://localhost:3001/documentation.

## Ideas / Roadmap

- LLM call to take info in and tell you if a course you're considering is worth it or not
- Need to be able to add a course via a provider
- "Goals" attachable to courses or providers, which can show up on a dashboard and checked off each day. Should direct link to a place the daily can be done.
  - ex: Doing 20 flashcards a day on Renshuu
  - ex: Maintaining a streak on a service like UXcel or TryHackMe
  - 2 types: "Target" and "Marathon"
    - Marathon being something like just doing tasks daily (Renshuu)
    - Target being "finish a course by X date", or "do course X times a week"
