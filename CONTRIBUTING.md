# Contributing

## Setup

```sh
nvm use   # or otherwise get Node 24.18.0, see .nvmrc
pnpm install
```

Common commands, run from the repo root:

```sh
pnpm build       # turbo run build, all packages
pnpm test        # turbo run test, all packages
pnpm lint        # eslint
pnpm format      # prettier -w
pnpm typecheck   # tsc -b
```

## Adding a package

Each package lives under `packages/<name>/` and is its own bounded context — see
[`docs/agents/domain.md`](./docs/agents/domain.md) for how `CONTEXT.md` and `docs/adr/` are
organized per package.

## Releasing

Versioning and publishing go through [Changesets](https://github.com/changesets/changesets).

1. On any PR that changes a published package, run `pnpm changeset` and describe the change.
   This writes a markdown file under `.changeset/` — commit it alongside your change.
2. Once changesets land on `main`, a bot-maintained "Version Packages" PR appears (or updates)
   automatically, bumping versions and `CHANGELOG.md` for every package with pending
   changesets.
3. Merging that PR triggers the actual `npm publish` and creates a GitHub Release, via
   [`.github/workflows/release.yml`](./.github/workflows/release.yml).

You don't publish manually — merging the Version Packages PR is the release. See
[ADR-0004](./docs/adr/0004-release-via-changesets-github-actions.md) for why the release
process is built this way.
