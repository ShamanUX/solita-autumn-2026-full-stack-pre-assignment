# Agent Instructions

## Project Context

This repository is the Solita Dev Academy Finland Autumn 2026 pre-assignment: an application for exploring Finnish electricity production, consumption, and price data.

Keep the implementation focused on a useful, well-tested vertical slice. Prefer the smallest clear solution over infrastructure or abstractions that the exercise does not yet need.

Read these files before making architectural changes:

- `README.md` for the project status and generative-AI disclosure.
- `docs/architecture-planning.md` for the initial technical direction.

The architecture document is a plan, not proof that every described feature exists. Check the current code and package manifests before relying on it, and update documentation when implementation decisions supersede the plan.

## Repository Layout

- `backend/`: Feathers.js 5 API written in TypeScript, using Koa, Knex, and PostgreSQL.
- `backend/src/app.ts`: application construction, database client, and service registration.
- `backend/src/index.ts`: process startup and shutdown handling.
- `backend/test/`: Vitest integration tests.
- `frontend/`: placeholder for the planned React and TypeScript frontend; it is not currently an npm workspace or runnable application.
- `docker-compose.yml`: PostgreSQL, API, and Adminer services.
- `Dockerfile` and `init-db.tar.gz`: supplied database image and seed data. Do not alter or regenerate the archive unless the task explicitly requires it.

## Development Commands

Run commands from the repository root unless noted otherwise.

```sh
npm run build
npm test
npm run dev
npm start
docker compose up --build
```

The backend test is an integration test and requires the seeded PostgreSQL database. Start it with:

```sh
docker compose up -d db
npm test
```

Local defaults are documented in `.env.example`. Do not commit secrets or local `.env` files.

## Implementation Conventions

- Keep TypeScript strict and preserve `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` compatibility.
- Use ES modules. Relative imports in backend TypeScript must use `.js` extensions so compiled Node.js imports resolve correctly.
- Construct the Feathers application in `createApp`; keep process lifecycle concerns in `index.ts`.
- Access PostgreSQL through the configured Knex client rather than creating unrelated connection mechanisms.
- Keep API behavior in Feathers services and register only the methods that should be publicly exposed.
- Clean up database clients, listeners, and other resources in tests and shutdown paths.
- Avoid speculative abstractions, new services, or dependencies unless they solve a current requirement.
- Follow the existing style: single quotes, no semicolons, and concise types and functions.

## Testing and Verification

- Add or update Vitest coverage for changed backend behavior.
- Prefer tests through the Feathers service interface; use HTTP-level tests when routing or middleware behavior is relevant.
- Use the real seeded database for database integration behavior. Do not replace meaningful integration coverage with mocks.
- Run `npm run build` for all TypeScript changes.
- Run `npm test` when PostgreSQL is available. If it is not available, report that limitation explicitly.
- For Docker or startup changes, verify `docker compose up --build` and confirm the health checks pass.

## Documentation and AI Disclosure

- Keep `README.md` concise and accurate as features and setup steps are added.
- Update `docs/architecture-planning.md` when a significant architectural decision changes.
- The README records how generative AI has been used. If agent work introduces a materially new AI use case, add an accurate, specific bullet rather than a broad claim. Do not remove or rewrite the author's existing disclosure without an explicit request.
