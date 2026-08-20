import { describe, expect, it } from 'vitest';
import { cacheFirebase } from './config.js';

describe('cacheFirebase', () => {
	it('points at the runtime entrypoint and forwards the config as-is', () => {
		const result = cacheFirebase({ hostingUrl: 'https://example.com', onUnsupported: 'error' });

		expect(result).toEqual({
			entrypoint: '@astro-firebase/hosting/runtime',
			config: { hostingUrl: 'https://example.com', onUnsupported: 'error' },
		});
	});

	it('does not inject a default onUnsupported value into the serialized config', () => {
		const result = cacheFirebase({ hostingUrl: 'https://example.com' });

		expect(result.config).toEqual({ hostingUrl: 'https://example.com' });
	});
});
