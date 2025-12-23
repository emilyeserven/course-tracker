App to stop me from buying courses I don't need.

Currently won't work via vercel etc due to DB needs.

# Ideas
- LLM call to take info in and tell you if a course you're considering is worth it or not
- Need to be able to add a course via a provider
- "Goals" attachable to courses or providers, which can show up on a dashboard and checked off each day. Should direct link to a place the daily can be done.
  - ex: Doing 20 flashcards a day on Renshuu
  - ex: Maintaining a streak on a service like UXcel or TryHackMe
  - 2 types: "Target" and "Marathon"
    - Marathon being something like just doing tasks daily (Renshuu)
    - Target being "finish a course by X date", or "do course X times a week"

# Local stuff
## DB
1. Run command for docker: `docker run --name course-postgres -e POSTGRES_PASSWORD=password -d -p 5432:5432 postgres`
  - Verify with `docker ps`
2. Run `npx drizzle-kit push`
