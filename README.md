# Electricity Data Application

This repository contains a web application for exploring Finnish electricity
production, consumption, and price data. The application is being developed as
the pre-assignment for Solita Dev Academy Finland Autumn 2026.

The planned stack is React and TypeScript for the frontend, Node.js and
TypeScript for the backend, and the provided PostgreSQL database. The initial
technical plan is available in [docs/architecture-planning.md](docs/architecture-planning.md).

## Running the backend locally

Docker Desktop and Node.js 22 or newer are required. Start PostgreSQL, the
Feathers API, and Adminer with:

```sh
docker compose up --build --renew-anon-volumes -d
```

The API health check is available at <http://localhost:3030/health> and Adminer
at <http://localhost:8088/>. For host development and tests, install packages
and use the supplied database:

```sh
npm install
docker compose up -d db
npm test
npm run dev
```

The default host database URL is
`postgresql://academy:academy@localhost:15432/electricity`. PostgreSQL still
uses port `5432` inside Docker. `POSTGRES_PORT` can override the exposed port;
set the same port in `DATABASE_URL` when running the backend directly on the
host.

### Daily statistics API

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

Open <http://localhost:5173/>. The graph month picker defaults to September
2024, while the table has an independent optional date range. Select
a table row action or a plotted graph day to open its single-day details. Run
the frontend production build and tests with:

```sh
npm run build --workspace frontend
npm run test --workspace frontend
```

## Use of Generative AI

Generative AI is used as a development assistant.

Each development choice is originally decided by me or an AI suggestion that was carefully reviewed.

So far, AI has been used to:

- inspect the provided Docker and database configuration;
- help plan the architecture;
- run installation for agreed upon architecture
- AI suggested Fastify for backend framework. I looked up alternatives and chose Feathers.js, seemed solid and it's nice to try new tech in tasks like this.
- Plan folder structure -> kept Docker files in root, add frontend/ and backend/ folders, with tsconfig file for each.
- I direct AI to write sufficiently concise changes as separate PRs.
- implement and test the single-day electricity statistics drill-down.
- normalize electricity units and apply Finnish number formatting.
- Correct the daily overview aggregation from hourly averages to daily totals.
