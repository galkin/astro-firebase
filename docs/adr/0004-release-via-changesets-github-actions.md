# Publish via Changesets' bot-PR flow, not OIDC trusted publishing

Reconstructed from a `/grill-with-docs` design session that reached explicit user agreement
before implementation started.

Releases run through `changesets/action` in GitHub Actions: pushes to `main` that carry
pending changesets get rolled into an auto-maintained "Version Packages" PR, and merging that
PR runs `pnpm release` (build + `changeset publish`). Reviewing that PR is the only approval
gate — no separate GitHub Environment/required-reviewer step, since for a single-maintainer
public package a second gate on top of the PR review is friction without a matching security
benefit.

Authentication to npm uses a granular, scoped, expiring `NPM_TOKEN` secret rather than npm's
OIDC Trusted Publishing, even though Trusted Publishing is GA and is the more modern option.
Two reasons pushed the decision here specifically, not as a permanent rejection of OIDC:

- Trusted Publishing can only be configured from an _existing_ package's settings page on
  npmjs.com — a package that has never been published has nowhere to configure it, so the
  very first publish of `@astro-firebase/hosting` needs a classic token regardless.
- This repo publishes with `pnpm publish` (via `changeset publish`), and pnpm's OIDC support
  has an open bug as of this writing ([pnpm#11513](https://github.com/pnpm/pnpm/issues/11513))
  that makes it unreliable for CI. `npm publish` itself supports OIDC fine; switching away
  from `pnpm publish` just for the release step, or waiting for the pnpm fix, are both viable
  paths to revisit later.

npm provenance attestation (`--provenance`, needs `permissions: id-token: write`) is enabled
regardless — it doesn't depend on which auth method is used.

Making the "Version Packages" PR possible also required flipping this repository's
Actions-wide default: `default_workflow_permissions` was `read`, and PR creation by
`GITHUB_TOKEN` was disabled. Enabling both repo-wide (rather than minting a second,
narrowly-scoped PAT/GitHub App just for this workflow) was chosen because every workflow in
this repo already declares its own explicit `permissions:` block, so the repo-wide default
mainly acts as a ceiling, not a grant — and the ongoing cost of a second credential to store
and rotate wasn't judged worth it at this repo's size.

## Status

Accepted
