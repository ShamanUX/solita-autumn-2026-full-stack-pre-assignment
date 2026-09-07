# Agent Instructions

## Project Context

This repository is the Solita Dev Academy Finland Autumn 2026 pre-assignment: an application for exploring Finnish electricity production, consumption, and price data.

Keep the implementation focused on a useful, well-tested vertical slice. Prefer the smallest clear solution over infrastructure or abstractions that the exercise does not yet need.

Read these files before making architectural changes:

- `README.md` for the project status and generative-AI disclosure.
- `docs/architecture.md` for the current system design and boundaries.

Check documentation against the current code and package manifests before relying on it, and update it when implementation decisions change.

## Repository Layout

- `backend/`: Feathers.js 5 API written in TypeScript, using Koa, Knex, and PostgreSQL.
- `backend/src/application.ts`: application construction, Knex client, middleware, and service registration.
- `backend/src/server.ts`: process startup and shutdown handling.
- `backend/src/daily-statistics.ts`: read-only daily summary and detail service.
- `backend/test/`: Vitest integration and REST tests against seeded PostgreSQL.
- `frontend/`: runnable React, Vite, TypeScript, and Material UI workspace.
- `frontend/src/components/`: stateful container and presentational UI components, with colocated Vitest tests.
- `frontend/src/data/`: HTTP request functions and API-facing types, with colocated tests.
- `docker-compose.yml`: PostgreSQL, API, and Adminer services. The frontend runs separately through Vite.
- `Dockerfile` and `init-db.tar.gz`: local PostgreSQL image and supplied seed data. Do not alter or regenerate the archive unless the task explicitly requires it.
- `backend/Dockerfile` and `backend/vercel.json`: backend container and Vercel deployment configuration.

## Development Commands

Use Node.js 22 or newer. Install dependencies from the repository root so the shared lockfile and both npm workspaces remain consistent. Run commands from the repository root unless noted otherwise.

```sh
npm run build
npm test
npm run dev
npm run dev:frontend
npm start
docker compose up --build
```

`npm run build` and `npm test` run checks in both workspaces. `npm run dev` starts only the backend, `npm run dev:frontend` starts the Vite frontend, and `npm start` starts the previously built backend.

Backend integration tests require the seeded PostgreSQL database. Start it before running the complete test suite or backend-only tests:

```sh
docker compose up -d db
npm test
```

Useful workspace-specific checks are:

```sh
npm run build --workspace backend
npm run build --workspace frontend
npm run test --workspace backend
npm run test --workspace frontend
```

Frontend-only tests do not require PostgreSQL. Backend and Compose defaults are documented in `.env.example`; the Vite proxy target is documented in `frontend/.env.example`. Do not commit secrets or local `.env` files.

## Implementation Conventions

- Keep TypeScript strict and preserve `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` compatibility.
- Use ES modules. Relative imports in project TypeScript use `.js` extensions; preserve this convention in both workspaces.
- Construct the Feathers application in `createApp` in `application.ts`; keep process lifecycle concerns in `server.ts`.
- Access PostgreSQL through the configured Knex client rather than creating unrelated connection mechanisms.
- Keep API behavior in Feathers services and register only the methods that should be publicly exposed.
- Keep the daily-statistics API read-only unless a requirement explicitly calls for mutation.
- Preserve the frontend's separation between stateful container logic, presentational components, and HTTP data modules. Use Material UI as the established component system.
- Frontend data modules currently import shared API model types from backend source. Keep both workspaces aligned when changing those types unless intentionally changing and documenting the type-sharing strategy.
- Strive for minimal changes.
- Clean up database clients, listeners, and other resources in tests and shutdown paths.
- Avoid speculative abstractions, new services, or dependencies unless they solve a current requirement.
- Follow `.prettierrc`: single quotes, no semicolons, trailing commas, two-space indentation, 80-column width, and LF endings. There are currently no lint or formatting scripts; do not assume they exist.

## Testing and Verification

- Add or update Vitest coverage appropriate to the workspace and behavior changed.
- Prefer tests through the Feathers service interface; use HTTP-level tests when routing or middleware behavior is relevant.
- Use the real seeded database for database integration behavior. Do not replace meaningful integration coverage with mocks.
- Use Testing Library and jsdom for frontend component behavior, and test HTTP data modules at their request boundary.
- Use workspace-specific checks while iterating, then run root `npm run build` for TypeScript changes and root `npm test` when PostgreSQL is available.
- If PostgreSQL is unavailable, run frontend tests where relevant and report that backend integration tests were not run.
- For Docker or startup changes, verify `docker compose up --build` and confirm the health checks pass.

## Documentation and AI Disclosure

- Keep `README.md` concise and accurate as features and setup steps are added.
- Update `docs/architecture.md` when a significant architectural decision changes.
