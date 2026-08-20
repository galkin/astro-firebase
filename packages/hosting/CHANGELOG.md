# @astro-firebase/hosting

## 0.1.0

### Minor Changes

- [`f8754c3`](https://github.com/galkin/astro-firebase/commit/f8754c3e8f07cbf23c7e7c9654985a3be8b2db3a) Thanks [@galkin](https://github.com/galkin)! - Add `@astro-firebase/hosting`, a Firebase Hosting CDN cache provider implementing Astro's Cache Provider API: `setHeaders()` (CDN-facing `s-maxage`, `Last-Modified`/`ETag` passthrough) and `invalidate()` (path purge via Firebase's undocumented `PURGE` method). Cache tags and stale-while-revalidate, which Firebase Hosting's CDN doesn't support, are governed by a configurable `onUnsupported` policy.
