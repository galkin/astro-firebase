# @astro-firebase/hosting

[![npm](https://img.shields.io/npm/v/@astro-firebase/hosting)](https://www.npmjs.com/package/@astro-firebase/hosting)
[![license](https://img.shields.io/npm/l/@astro-firebase/hosting)](../../LICENSE)

A Firebase Hosting CDN [cache provider](https://docs.astro.build/en/reference/cache-provider-reference/) for Astro — the same pattern as `@astrojs/netlify/cache`, `@astrojs/vercel/cache`, and `@astrojs/cloudflare/cache`, targeting Firebase Hosting instead.

It only sets response headers and calls Firebase Hosting's cache-purge endpoint. It does not configure `firebase.json` and does not deploy — pair it with whatever SSR adapter you already use to run Astro on Firebase (Cloud Functions, Cloud Run, etc.).

## Installation

```sh
pnpm add @astro-firebase/hosting
```

Requires `astro@^7.0.0`.

## Usage

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import { cacheFirebase } from '@astro-firebase/hosting';

export default defineConfig({
	cache: {
		provider: cacheFirebase({
			hostingUrl: 'https://example.com',
		}),
	},
});
```

Then, in a page or API route:

```ts
// src/pages/index.astro or src/pages/api/*.ts
Astro.cache.set({ maxAge: 300 });
```

## Config

| Option          | Type                            | Default  | Description                                                                                                          |
| --------------- | ------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------- |
| `hostingUrl`    | `string`                        | required | Full base URL that `invalidate({ path })` sends purge requests against. Never guessed from a Firebase site ID.       |
| `onUnsupported` | `'silent' \| 'warn' \| 'error'` | `'warn'` | How to react to `tags`, `swr`, or `invalidate({ tags })` — none of which Firebase Hosting's CDN supports. See below. |

## What it does and doesn't do

- **`maxAge`** → `Cache-Control: public, s-maxage=<maxAge>`. Never sets `max-age` — `cache.set()` configures CDN freshness only; set your own `Cache-Control` if you also want to control browser caching.
- **`lastModified` / `etag`** → passed straight through as `Last-Modified` / `ETag`. Nothing is computed. `304` negotiation is handled by Firebase Hosting's CDN itself, like any standard HTTP cache.
- **`tags` / `swr`** → Firebase Hosting's CDN doesn't support either. Governed by `onUnsupported`: `'warn'` omits the header and logs, `'error'` throws, `'silent'` does neither.
- **`invalidate({ path })`** → sends an HTTP `PURGE` request to `<hostingUrl><path>`. This is Firebase Hosting's only point-purge mechanism, and it is **undocumented and unauthenticated** — see [ADR-0001](./docs/adr/0001-purge-via-undocumented-firebase-endpoint.md) for the risk this carries. Access-control whatever route in your app calls `invalidate()`.
- **`invalidate({ tags })`** → governed by the same `onUnsupported` policy, since Firebase Hosting has no tag store to purge against.
- **`onRequest`** → not implemented. Firebase Hosting's CDN already does the caching; there's no in-process store to intercept requests for.

See [`CONTEXT.md`](./CONTEXT.md) and [`docs/adr/`](./docs/adr/) for the full domain vocabulary and the reasoning behind these decisions.

## License

MIT
