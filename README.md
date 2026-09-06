# Electricity Data Application

This repository contains a web application for exploring Finnish electricity
production, consumption, and price data. The application is being developed as
the pre-assignment for Solita Dev Academy Finland Autumn 2026.

The planned stack is React and TypeScript for the frontend, Node.js and
TypeScript for the backend, and the provided PostgreSQL database. The initial
technical plan is available in [docs/architecture-planning.md](docs/architecture-planning.md).

## Running the backend

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

`GET /daily-statistics` returns daily averages calculated from the available
hourly production, consumption, and price values. The response contains a
`data` array and the total number of matching dates in `total`.

The endpoint accepts inclusive `from` and `to` dates in `YYYY-MM-DD` format,
zero-based `page`, `pageSize` up to 100, `sortField`, and `sortDirection`.
Supported sort fields are `date`, `averageProduction`, `averageConsumption`,
and `averagePrice`. For example:

```text
http://localhost:3030/daily-statistics?from=2024-09-01&to=2024-09-30&page=0&pageSize=10&sortField=date&sortDirection=desc
```

## Running the frontend

The React frontend currently uses a small set of temporary daily-statistics
fixtures matching the backend response contract. Start the Vite development
server with:

```sh
npm install
npm run dev:frontend
```

Open <http://localhost:5173/>. The fixture provider supports the same date
filtering, sorting, and pagination behavior as the API. Run the frontend
production build and tests with:

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
- implement and verify the initial Feathers database health check and Docker integration.
- Plan PR implementation steps. I direct the AI to implement logical parts of the software as separate PRs.
- bootstrap, implement, and test the fixture-backed React statistics interface.
