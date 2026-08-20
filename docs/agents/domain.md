# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Layout: multi-context

This is a monorepo (see [ADR-0001](../adr/0001-monorepo-tooling-mirrors-astro.md)) — each package under `packages/<name>/` is its own bounded context with its own domain vocabulary. There is no single root `CONTEXT.md`.

```
/
├── CONTEXT-MAP.md                        ← created once the first package's context is defined
├── docs/adr/                             ← system-wide/tooling decisions (monorepo tooling, linting, TS setup, ...)
└── packages/
    ├── auth/
    │   ├── CONTEXT.md                    ← this package's domain glossary
    │   └── docs/adr/                     ← decisions scoped to this package
    └── firestore/
        ├── CONTEXT.md
        └── docs/adr/
```

## Before exploring, read these

- **`CONTEXT-MAP.md`** at the repo root, if it exists — find the entry for the package you're touching, then read that package's `CONTEXT.md`.
- **`docs/adr/`** at the repo root — system-wide decisions that apply across all packages.
- **`packages/<name>/docs/adr/`** — decisions scoped to the package you're touching.

If any of these don't exist yet, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The `/domain-modeling` skill (reached via `/grill-with-docs` and `/improve-codebase-architecture`) creates them lazily, per package, when terms or decisions actually get resolved for that package.

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in the relevant package's `CONTEXT.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal — either you're inventing language the package doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag ADR conflicts

If your output contradicts an existing ADR — root or package-scoped — surface it explicitly rather than silently overriding:

> _Contradicts ADR-0002 (ESLint + Prettier, not Biome) — but worth reopening because…_
