# TypeScript project references for composite builds

Packages in this monorepo can depend on one another (e.g. a shared internal utilities package consumed by several Firebase integrations). We use TypeScript project references (`tsc -b`, `composite: true`) with a root `tsconfig.json`, rather than giving each package an independent, unrelated `tsconfig.json`. This lets one package see another's types without a full rebuild and lets `tsc -b` cache incrementally across the whole workspace. The trade-off is a more involved initial setup (each package's `tsconfig.json` must declare its `references`), which is worth calling out since a plain per-package config is the simpler default most people reach for first.

## Status

Accepted
