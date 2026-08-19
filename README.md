# Daymark

Javier’s planner: Today, week, tasks, journal, habits, ledger, and Ask.

## Run

```bash
npm install
cp .env.example .env.local
# OPENAI_API_KEY=sk-...
npm run dev
```

App is at `http://localhost:8080`.

## Notes

- Board data lives in the browser until you add a real backend.
- Ask needs `OPENAI_API_KEY` in `.env.local`. Never commit that file.
- `npm run typecheck` before you ship.
