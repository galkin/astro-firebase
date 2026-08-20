# Monorepo tooling mirrors withastro/astro

This repo hosts multiple Firebase-integration packages for Astro, each shipped independently to npm under the `@astro-firebase/*` scope. We adopted the same core tooling as the upstream `withastro/astro` monorepo — pnpm workspaces for dependency management, Turborepo for cached/parallel task orchestration, and Changesets for independent per-package versioning and changelogs — rather than evaluating alternatives (Nx, Lerna, plain `npm`/`yarn` workspaces) from scratch. Astro integrations are consumed by Astro users, so staying close to the ecosystem's own conventions reduces friction for contributors already familiar with it, and the tooling is proven at a much larger scale than we need.

## Status

Accepted
