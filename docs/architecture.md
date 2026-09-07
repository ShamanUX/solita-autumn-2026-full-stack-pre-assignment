# Architecture

## Goals

The application presents Finnish electricity production, consumption, and price
data as a small, well-tested vertical slice. The design favors clear boundaries
and direct data flow over infrastructure or abstractions that the current scope
does not require.

## System overview

The system consists of a React and TypeScript frontend, a Node.js and TypeScript
API, and PostgreSQL. The browser requests data from the API, and the API accesses
PostgreSQL through Knex.

Docker Compose provides PostgreSQL, the API, and Adminer for local use. In the
cloud environment, Vercel hosts the backend and the `DATABASE_URL` environment
variable connects it to the hosted PostgreSQL database. This keeps application
construction independent of the deployment environment.

## Backend

Feathers.js provides the backend's service-oriented application layer. A
Feathers service is a TypeScript object registered under a path with standard
methods such as `find` and `get`. The application calls the same service
interface directly in tests, while the Feathers Koa adapter exposes it as REST
endpoints for the frontend. This keeps transport concerns separate from domain
and database logic without requiring separate controllers and routes.

The application registers only `find` and `get` for `daily-statistics`, making
the public API read-only. Feathers also composes the Koa request parser, error
handling, REST transport, typed service lookup, and shared application
configuration in one place.

Knex is injected into the services and owns all PostgreSQL access. The
`daily-statistics` service validates query input, performs bounded filtering,
pagination, and sorting, and converts database rows into the API model. It
normalizes production and consumption to MWh, retains prices in c/kWh, and
represents missing measurements as `null`. A separate health service verifies
that the database is connected and contains the supplied data.

## Frontend

The React frontend separates stateful container logic, presentational
components, and HTTP data modules. `DailyStatisticsContainer` owns API requests,
filters, pagination, sorting, display mode, and drill-down state. Data flows to
presentational components through props, and user actions return through
callbacks.

Table, graph, and single-day requests have independent state so changing views
does not discard the user's context. The current in-place drill-down does not
require a router, and component-local state avoids a global state dependency.
Material UI supplies the component and visualization primitives.

## Testing

Backend integration tests call the Feathers service interface against the real
seeded PostgreSQL database. Frontend container tests cover loading and state
transitions, presentational component tests cover behavior and callbacks, and
data-module tests cover HTTP request construction and failures.
