import type { CacheProviderFactory } from 'astro';
import { normalizeTags, setConditionalHeaders } from 'astro/cache/provider-utils';
import { handleUnsupported, type UnsupportedPolicy } from './policy.js';
import { purge } from './purge.js';
import type { FirebaseCacheConfig } from './types.js';

const factory: CacheProviderFactory = (config) => {
	const { hostingUrl, onUnsupported = 'warn' as UnsupportedPolicy } = config as FirebaseCacheConfig;

	return {
		name: 'firebase-hosting',

		setHeaders(options) {
			const headers = new Headers();

			if (options.tags?.length) {
				handleUnsupported(
					onUnsupported,
					`Firebase Hosting does not support cache tags; ignoring: ${options.tags.join(', ')}`,
				);
			}

			if (options.swr !== undefined) {
				handleUnsupported(
					onUnsupported,
					`Firebase Hosting does not honor stale-while-revalidate; ignoring swr=${options.swr}`,
				);
			}

			if (options.maxAge !== undefined) {
				headers.set('Cache-Control', `public, s-maxage=${options.maxAge}`);
			}

			setConditionalHeaders(headers, options);

			return headers;
		},

		async invalidate(options) {
			const tags = normalizeTags(options.tags);
			if (tags.length) {
				handleUnsupported(
					onUnsupported,
					`Firebase Hosting does not support tag-based invalidation; cannot invalidate: ${tags.join(', ')}`,
				);
			}

			if (options.path) {
				await purge(hostingUrl, options.path);
			}
		},
	};
};

export default factory;
