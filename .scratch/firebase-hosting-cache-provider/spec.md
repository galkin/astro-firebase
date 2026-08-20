# `@astro-firebase/hosting` — Firebase Hosting cache provider

Status: implemented, pending review

Reconstructed from a `/grilling` design session (5 rounds) that reached explicit user
agreement before implementation started. Not a pre-written spec — written after the
grilling session to give this review something concrete to check against.

## What this package is

Implements Astro's [Cache Provider API](https://docs.astro.build/en/reference/cache-provider-reference/)
(`astro@7.0.0+`) for Firebase Hosting's CDN — same pattern as `@astrojs/netlify/cache`,
`@astrojs/vercel/cache`, `@astrojs/cloudflare/cache`.

- Package name: `@astro-firebase/hosting`.
- Public export: `cacheFirebase(config)` from the package **root** (not a `/cache` subpath —
  there is no co-located adapter in this package; the adapter is a separate future package,
  `@astro-firebase/adapter`).
- It is a **CDN provider**, not a runtime provider: implements `setHeaders()` and
  `invalidate()`; does **not** implement `onRequest()` (Firebase Hosting's CDN already does
  the caching — no in-process store needed).
- Out of scope: does not touch `firebase.json`, does not deploy.

## `cacheFirebase(config)` config

- `hostingUrl: string` — **required**, full base URL (e.g. a custom domain) that
  `invalidate({ path })` sends `PURGE` requests against. Never auto-derived from a Firebase
  site ID — a wrong guess would purge the wrong host silently.
- `onUnsupported?: 'silent' | 'warn' | 'error'` — **default `'warn'`**. A single key,
  deliberately not split per-directive, governing every place the provider is asked to do
  something Firebase Hosting's CDN cannot do:
  - a route sets a cache tag (`CacheOptions.tags`)
  - a route sets `swr` (`CacheOptions.swr`)
  - `invalidate({ tags })` is called
  - `'warn'`: omit the unsupported header / no-op the invalidation, and `console.warn`.
  - `'error'`: throw synchronously instead of warning.
  - `'silent'`: do neither — no header/no-op, no log.

## `setHeaders(options, request)`

- `Cache-Control: public, s-maxage=<maxAge>` when `options.maxAge` is set. **Never** sets
  `max-age` — `cache.set()` is defined to configure CDN freshness only, consistently with
  the other first-party providers (which use a split header so `max-age` is untouched);
  Firebase reads `Cache-Control` directly (no split-header channel), so we deliberately still
  only touch the CDN-facing directive (`s-maxage`) and leave browser caching to the
  developer's own code. Recorded as ADR-0002.
- `Last-Modified` / `ETag`: pure passthrough of `options.lastModified` / `options.etag` via
  Astro's own `setConditionalHeaders()` utility from `astro/cache/provider-utils`. The
  provider does not compute either value itself. `304` negotiation is left entirely to
  Firebase Hosting's CDN (a standard HTTP cache) — the provider does nothing extra for it.
- `tags` / `swr` present → governed by `onUnsupported` (see above); when not `'error'`, the
  corresponding header is fully omitted (not sent even harmlessly) rather than sent anyway.

## `invalidate(options)`

- `{ path }` → sends an HTTP `PURGE` request to `<hostingUrl><path>`. This is Firebase
  Hosting's only point-purge mechanism; it is **undocumented and unauthenticated** — Google
  never publishes it, and a 2017–2019 official Firebase-talk thread claims no purge API
  exists at all (superseded by later community reports). Recorded as ADR-0001, including the
  risk that Google could change or remove it without notice, and that callers must
  access-control whatever triggers `invalidate()` themselves.
- `{ tags }` → **no tag store exists on Firebase's side**, so this is governed by the same
  `onUnsupported` policy as the header case above (not a separate always-throw path — this
  was an explicit simplification the user chose over per-case handling).
- `{ path, tags }` together → both are handled independently (purge the path, apply the tag
  policy) in the same call.

## Explicitly out of scope for this package (per the grilling session)

- Generating or touching `firebase.json` (including static-file `headers` config).
- Deploying, or any adapter/SSR-rendering responsibility (that's `@astro-firebase/adapter`).
- Deriving `hostingUrl` automatically from a Firebase site ID.
- Any stateful tag→path index to fake tag-based invalidation.
