import type { UnsupportedPolicy } from './policy.js';

export interface FirebaseCacheConfig {
	/**
	 * Full base URL PURGE requests are sent against, e.g. `https://example.com`.
	 * Never derived from a Firebase site ID — sites on a custom domain would
	 * otherwise get silently purged on the wrong host.
	 */
	hostingUrl: string;

	/**
	 * How to react when asked to do something Firebase Hosting's CDN cannot do:
	 * set a cache tag, set stale-while-revalidate, or invalidate by tag.
	 *
	 * @default 'warn'
	 */
	onUnsupported?: UnsupportedPolicy;
}
