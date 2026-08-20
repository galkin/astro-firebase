import type { CacheProviderConfig } from 'astro';
import type { FirebaseCacheConfig } from './types.js';

export function cacheFirebase(config: FirebaseCacheConfig): CacheProviderConfig {
	return {
		entrypoint: '@astro-firebase/hosting/runtime',
		config,
	};
}
