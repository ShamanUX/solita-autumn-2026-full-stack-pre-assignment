# Architecture and Installation Plan

Status: daily statistics API and API-backed frontend implemented

## Goals

The application will present daily electricity statistics from the PostgreSQL
data supplied with the assignment. The first release should provide a useful,
well-tested vertical slice without introducing infrastructure that the scope
does not require.

## Technologies

React, TypeScript, Node.js stack.

We're going to use Feathers.js as our full-stack framework to handle API routing and database connectivity out of the box.

## Backend integration

The Feathers TypeScript backend will live in `backend/` and connect to the
provided PostgreSQL database through Knex. Docker Compose will run it as a
separate Node.js container after PostgreSQL is healthy. A health endpoint and
integration test will verify the database connection.

The read-only `daily-statistics` Feathers service groups the source rows by
date and calculates averages for the available production, consumption, and
price observations. Its REST endpoint provides inclusive date filtering,
server-side pagination, and allowlisted single-column ordering. Missing
measurements remain `null` rather than being treated as zero.

## Frontend architecture

The React frontend will feature no routing for this usecase. We follow the Container and Presentational Component pattern, separating logic and visual components.

`DailyStatisticsContainer` owns API, graph month, table date range, pagination,
sorting, and display-mode state. The table requests server-paginated sets of 10
daily averages with its independently applied optional date range. When the
graph is opened, it requests the latest available date and uses its month as the
default. Each selected month is then loaded in one bounded API request
containing at most 31 daily averages.
`DailyStatisticsView` composes controlled presentational components.

`DailyStatisticsDisplay` provides the table/graph switch and shared loading and
error states. Its MUI month picker is shown only for the graph, and its date
range filter is shown only for the table. The table uses server-side pagination
and sorting, while the graph keeps electricity values and price on separate
axes because they use different scales.

On desktop, the page uses the available `100vh` with a `900px` minimum height.
This keeps the controls and active data view in one viewport at normal desktop
sizes while allowing the document to scroll on shorter screens. Mobile retains
content-driven height so the controls and visualizations do not become cramped.

Data flows down from the container through props, and user actions flow back up
through callbacks. This keeps API and state transitions separate from rendering
without introducing a global state library for the current scope.

Tests follow the same boundaries: container tests cover data loading and state
transitions, direct component tests cover presentational behavior and callbacks,
and data-module tests cover HTTP request construction and failures. `App` does
not need a separate behavioral test while it remains a one-line composition
root.
