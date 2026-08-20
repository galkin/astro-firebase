# Rely on Firebase's undocumented PURGE method for path invalidation

Firebase Hosting has no documented, official API for purging a single cached path from its CDN — the only officially acknowledged mechanisms are a full-site redeploy or waiting out a short TTL (confirmed directly with Google via the [firebase-talk thread](https://groups.google.com/g/firebase-talk/c/_q9qM82QV6U/m/Xsy1OP6BFQAJ), 2017–2019). Community reports since then show an undocumented `PURGE https://<host>/<path>` HTTP method that does work and requires no authentication. We implement `CacheProvider.invalidate({ path })` on top of this undocumented method anyway, because it's the only way to offer path-level invalidation at all — the alternative is not implementing `invalidate({ path })` correctly.

## Consequences

- Google could remove or change this behavior without notice; `invalidate({ path })` has no documented stability guarantee.
- The endpoint is unauthenticated — anything that calls our `invalidate()` should itself be access-controlled, since Firebase does not check who is purging.
