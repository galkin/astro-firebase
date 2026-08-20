# ESLint + Prettier, not Biome

`withastro/astro` — the monorepo we otherwise mirror our tooling on (see [ADR-0001](./0001-monorepo-tooling-mirrors-astro.md)) — uses Biome as its primary linter and formatter, with ESLint and Prettier relegated to narrow supporting roles. We deliberately did not follow that: this repo uses ESLint for linting and Prettier for code style, with no Biome. For a small set of Firebase-integration packages, running two overlapping lint/format engines adds a second tool to configure and keep in sync without a corresponding benefit; ESLint plus Prettier alone is enough at this scale, and it is the combination most contributors already know.

## Status

Accepted
