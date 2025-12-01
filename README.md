App to stop me from buying courses I don't need.

Currently won't work via vercel etc due to DB needs.

# Ideas
- LLM call to take info in and tell you if a course you're considering is worth it or not

# Local stuff
## DB
1. Run command for docker: `docker run --name course-postgres -e POSTGRES_PASSWORD=password -d -p 5432:5432 postgres`
  - Verify with `docker ps`
2. Run `npx drizzle-kit push`