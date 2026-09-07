# Architecture and Installation Plan

Status: daily statistics overview and single-day drill-down implemented

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
date and calculates production and consumption totals and average price from
the available observations. Its REST endpoint provides inclusive date filtering,
server-side pagination, and allowlisted single-column ordering. Missing
measurements remain `null` rather than being treated as zero.
Source consumption values are converted from kWh to MWh at the service
boundary so production and consumption use a common scale in API responses.
Prices remain in their source c/kWh unit.

The same service exposes `GET /daily-statistics/:date` for a single-day detail.
It returns ordered hourly observations, production and consumption sums, the
average price, the hour with the greatest consumption-to-production ratio, and
the five lowest-priced hours. Ratio candidates require consumption and non-zero
production. Equal prices retain chronological ordering.

## Frontend architecture

The React frontend will feature no routing for this usecase. We follow the Container and Presentational Component pattern, separating logic and visual components.

`DailyStatisticsContainer` owns API, graph month, table date range, pagination,
sorting, and display-mode state. The table requests server-paginated sets of 10
daily statistics with its independently applied optional date range. The graph
defaults to September 2024, and each selected month is loaded in one bounded API
request containing at most 31 daily statistics. Table and graph results have
independent state and are retained across display changes, so switching modes
does not repeat an unchanged query.
`DailyStatisticsPage` composes controlled presentational components.

`DailyStatisticsOverview` provides the table/graph switch and renders the active
mode's loading and error state. Its MUI month picker is shown only for the graph,
and its MUI date pickers are shown only for the table's date range filter. The
table uses server-side pagination and sorting, while the graph keeps electricity
values and price on separate axes because they use different scales.

Selecting a table action or a plotted graph day opens `SingleDayDetails` in the
same content panel. The container loads the selected date independently and
retains the overview's display mode, month, date range, page, and sorting so the
Back action restores the previous context without refetching it. No router is
needed for this in-place drill-down.

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
