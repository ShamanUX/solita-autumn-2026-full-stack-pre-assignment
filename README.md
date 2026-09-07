# Electricity Data Application

This repository contains a web application for exploring Finnish electricity
production, consumption, and price data. The application is being developed as
the pre-assignment for Solita Dev Academy Finland Autumn 2026.

The planned stack is React and TypeScript for the frontend, Node.js and
TypeScript for the backend, and the provided PostgreSQL database. The initial
technical plan is available in [docs/architecture-planning.md](docs/architecture-planning.md).

## Running the backend locally

The backend and database are hosted on Vercel at
<https://solita-electricity-backend.vercel.app/>.

Docker Desktop is required to run the backend locally. Start PostgreSQL, the
Feathers API, and Adminer with:

```sh
docker compose up --build --renew-anon-volumes -d
```

The API health check is available at <http://localhost:3030/health> and Adminer
at <http://localhost:8088/>.

## Daily statistics API

`GET /daily-statistics` returns daily production and consumption totals and the
average price calculated from the available hourly values. The response contains a
`data` array and the total number of matching dates in `total`.
Production and consumption are returned in a common MWh scale: source
consumption values are converted from kWh to MWh. Prices retain their source
unit of c/kWh. Daily MWh totals are rounded to whole numbers.

The endpoint accepts inclusive `from` and `to` dates in `YYYY-MM-DD` format,
zero-based `page`, `pageSize` up to 100, `sortField`, and `sortDirection`.
Supported sort fields are `date`, `totalProduction`, `totalConsumption`,
and `averagePrice`. For example:

```text
http://localhost:3030/daily-statistics?from=2024-09-01&to=2024-09-30&page=0&pageSize=10&sortField=date&sortDirection=desc
```

`GET /daily-statistics/:date` returns details for one date. The response
contains hourly observations, daily production and consumption totals, average
price, the hour with the highest consumption-to-production ratio, and the five
cheapest hours. Missing measurements remain `null`; rows without both
consumption and non-zero production are excluded from the ratio comparison.

## Running the frontend

The React frontend loads daily statistics from the backend through the Vite
development proxy. Start the Docker services as described above, then start the
frontend with:

```sh
npm install
npm run dev:frontend
```

By default, the local db and backend are used. In the `frontend/` folder's `.env` file, add

`BACKEND_URL=https://solita-electricity-backend.vercel.app/`

to use the cloud hosted backend instead.

Open <http://localhost:5173/>. The graph month picker defaults to September
2024, while the table has an independent optional date range. Select
a table row action or a plotted graph day to open its single-day details.

## Testing and building

The root commands run checks for both the backend and frontend workspaces. The
backend integration tests require the supplied PostgreSQL database. If the full
Docker Compose stack is not already running, start only the database first:

```sh
docker compose up -d db
npm test
npm run build
```

When the full stack is already running, PostgreSQL is available and the
database-only Compose command is not needed. Node.js 22 or newer and the
dependencies installed above are required to run these checks.

## Next steps

- Install and configure ESLint for the backend TypeScript and frontend React
  code.
- Install Prettier and add formatting scripts for the existing configuration.
- Configure Husky and lint-staged to run fast linting and formatting checks
  before commits.
- Add GitHub Actions to run linting, builds, and tests, including PostgreSQL for
  the backend integration tests.
- Configure Dependabot or Renovate for automated dependency updates.
- Add E2E tests.

Full builds and test suites should run in CI rather than in pre-commit hooks so
that local commits remain fast.

## Use of Generative AI

Generative AI is used as a development assistant.

Each development choice is originally decided by me or is an AI suggestion that was carefully reviewed.

AI has been used to:

- Run installation for agreed upon architecture
- Plan folder structure
- Help create in-depth specifications for features and tests, and run the implementation to create PRs that are comfortably sized to be reviewed by a human.
- Update docs with up-to-date information.
