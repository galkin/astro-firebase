# Hosting

Implements Astro's [Cache Provider API](https://docs.astro.build/en/reference/cache-provider-reference/) (added in `astro@7.0.0`) for Firebase Hosting's CDN — the same pattern as `@astrojs/netlify/cache`, `@astrojs/vercel/cache`, and `@astrojs/cloudflare/cache`. Exported as `cacheFirebase()` from the package root. It does not configure `firebase.json` and does not perform deploys — SSR adapter concerns live in the separate `@astro-firebase/adapter` package.
_Avoid_: Adapter, integration (those are distinct, pre-existing Astro/package concepts — this package is specifically a Cache Provider)

## Language

**Cache Provider**:
An object implementing Astro's `CacheProvider` interface (`setHeaders()`, `invalidate()`, optional `onRequest()`), registered via `cache.provider` in `astro.config.mjs`. This package's Firebase Hosting provider is a **CDN provider** (translates `Astro.cache.set()` calls into response headers that Firebase Hosting's CDN reads directly, since caching happens at the CDN, not in our process) rather than a **runtime provider** (which would intercept requests via `onRequest()` and store responses in-process). `onRequest()` is intentionally left unimplemented.

**Cache Tag**:
An HTTP header (e.g. `Cache-Tag`/`Surrogate-Key`) that lets a CDN purge cached entries by label instead of by exact path. Firebase Hosting's CDN does not support this at all — no header we could set would have any effect. Governed by the `onUnsupported` policy.
_Avoid_: Surrogate key (use "Cache Tag" consistently even though the underlying header name varies by platform)

**Stale-While-Revalidate (SWR)**:
The `Cache-Control: stale-while-revalidate` directive, letting a CDN serve a stale response while revalidating in the background. Firebase Hosting's CDN does not honor this directive. Governed by the `onUnsupported` policy.

**`onUnsupported` policy**:
A single `cacheFirebase()` config value (`'silent' | 'warn' | 'error'`, default `'warn'`) governing every place the provider is asked to do something Firebase Hosting's CDN cannot do: setting a Cache Tag, setting SWR, or calling `invalidate({ tags })`. `'warn'` omits the unsupported header (or no-ops the invalidation) and logs; `'error'` throws synchronously instead; `'silent'` does neither. One policy for all three cases, by deliberate choice over finer-grained keys.

**PURGE (Firebase Hosting)**:
An undocumented, unauthenticated HTTP method (`PURGE https://<hostingUrl>/<path>`) that purges a single exact path from Firebase Hosting's CDN — confirmed working via community reports (Google's own 2017–2019 firebase-talk thread predates it and claims no purge API exists at all). This is the only mechanism `invalidate({ path })` has to work with; there is no tag-based purge. Because Google documents neither its existence nor its stability, and it requires no authentication, treat it as a fact worth an ADR, not an implementation detail.

**`hostingUrl`**:
Required `cacheFirebase()` config: the full base URL PURGE requests are sent against (e.g. a custom domain). Never auto-derived from a Firebase site ID — guessing wrong would silently purge the wrong host.
