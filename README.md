# Pokédex — Backend

NestJS API that proxies the [PokéAPI](https://pokeapi.co) and persists a list of
favorite Pokémon in Postgres.

## Approach

- **NestJS + TypeScript**, split into a `pokemon` module (proxy + aggregation)
  and a `favorites` module (persistence).
- The frontend never calls PokéAPI directly — the backend fetches, enriches, and
  shapes the data into clean DTOs.
- The 150-Pokémon list and per-Pokémon details are **cached in memory** (the data
  is static), so PokéAPI is only hit once per resource.
- Favorites are stored in **Postgres via TypeORM**, keyed by `pokemonId`. On add,
  the backend enriches with name + sprite so the favorites list is self-contained.

## Run locally

Requires Node 20+ and a Postgres database.

```bash
npm install
cp .env.example .env   # then fill in DATABASE_URL etc.
npm run start:dev
```

API runs at `http://localhost:3000` under the `/api` prefix. Schema is
auto-synced in dev, so no migrations are needed to get started.

```bash
npm run start:prod   # run the compiled build
npm run test
```

### Environment

See `.env.example`. Key vars: `PORT`, `FRONTEND_ORIGIN` (CORS), `DATABASE_URL`,
and `POKEAPI_BASE_URL`.

## API

All routes are under `/api`:

| Method & path | Description |
|---|---|
| `GET /health` | Health check |
| `GET /pokemon` | First 150 Pokémon (summaries) |
| `GET /pokemon/:id` | Single Pokémon detail (abilities, types, evolutions) |
| `GET /favorites` | List favorites |
| `POST /favorites` | Add a favorite — body `{ pokemonId }` (1–150) |
| `DELETE /favorites/:id` | Remove a favorite (idempotent) |

## Assumptions

- Single global favorites list, no authentication or per-user accounts.
- Only the first 150 Pokémon are supported; `POST /favorites` validates that
  range and rejects duplicates (`409`).
- Upstream PokéAPI failures surface as `502`; unknown IDs as `404`.
