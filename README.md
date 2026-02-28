# Wishflix

Shared streaming-style wishlist app for couples or groups.

## Tech Stack

- Next.js (App Router)
- Prisma + SQLite
- Local auth (email/password + cookie session)
- TMDB (movies/series) + Open Library (books/comics)

## Requirements

- Node.js 20+
- npm

## Quick Start (Local)

1. Install dependencies:

```bash
npm install
```

2. Create env file:

```bash
cp .env.example .env
```

3. Edit `.env`:
- `DATABASE_URL`: keep `file:./dev.db` for local.
- `SESSION_SECRET`: you can keep the default for local.
- `TMDB_API_KEY`: set your API key (required for movie/series discovery rails).

4. Apply migrations:

```bash
npx prisma migrate deploy
```

5. Optional demo seed:

```bash
npm run db:seed
```

6. Run app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Custom Local Port

Run on another port (example `4000`):

```bash
npm run dev -- -p 4000
```

Then open `http://localhost:4000`.

## Main Endpoints

- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/session`
- `GET /api/discover`
- `GET /api/items?type=movie&status=wishlist`
- `POST /api/items`
- `PATCH /api/items/:id/complete`
- `PATCH /api/items/:id/discard`
- `GET /api/spaces/me`
- `POST /api/spaces/create`
- `POST /api/spaces/join`
- `POST /api/spaces/switch-active`

## Tests

```bash
npm test
```

## Auth Troubleshooting

If login/register returns "Error de autenticacion" with status 500:

```bash
npx prisma generate
npx prisma migrate deploy
```

Then restart the dev server.
