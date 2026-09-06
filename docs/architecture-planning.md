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
