# Electricity Data Application

This repository contains a web application for exploring Finnish electricity
production, consumption, and price data. The application is being developed as
the pre-assignment for Solita Dev Academy Finland Autumn 2026.

The planned stack is React and TypeScript for the frontend, Node.js and
TypeScript for the backend, and the provided PostgreSQL database. The initial
technical plan is available in [docs/architecture-planning.md](docs/architecture-planning.md).

## Use of Generative AI

Generative AI is used as a development assistant.

Each development choice is originally decided by me or an AI suggestion that was carefully reviewed.

So far, AI has been used to:

- inspect the provided Docker and database configuration;
- help plan the React and Node.js architecture;
- AI suggested Fastify for backend framework. I looked up alternatives and chose Feathers.js, seemed solid and it's nice to try new tech in tasks like this.
- Plan folder structure -> kept Docker files in root, add frontend/ and backend/ folders, with tsconfig file for each.
