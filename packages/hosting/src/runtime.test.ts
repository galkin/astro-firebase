import type { CacheOptions, InvalidateOptions } from 'astro';
import { afterEach, describe, expect, it, vi } from 'vitest';
import factory from './runtime.js';

const dummyRequest = new Request('https://example.com/blog/post-1');

describe('firebase cache provider: setHeaders', () => {
	afterEach(() => {
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	it('sets only s-maxage, never max-age, for maxAge', () => {
		const provider = factory({ hostingUrl: 'https://example.com' });

		const headers = provider.setHeaders({ maxAge: 300 } as CacheOptions, dummyRequest);

		expect(headers.get('Cache-Control')).toBe('public, s-maxage=300');
	});

	it('sets no Cache-Control header when maxAge is not provided', () => {
		const provider = factory({ hostingUrl: 'https://example.com' });

		const headers = provider.setHeaders({} as CacheOptions, dummyRequest);

		expect(headers.has('Cache-Control')).toBe(false);
	});

	it('passes lastModified and etag through as conditional headers', () => {
		const provider = factory({ hostingUrl: 'https://example.com' });
		const lastModified = new Date('2026-01-01T00:00:00.000Z');

		const headers = provider.setHeaders(
			{ lastModified, etag: '"abc123"' } as CacheOptions,
			dummyRequest,
		);

		expect(headers.get('Last-Modified')).toBe(lastModified.toUTCString());
		expect(headers.get('ETag')).toBe('"abc123"');
	});

	it('warns and omits the header when tags are set (default policy)', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const provider = factory({ hostingUrl: 'https://example.com' });

		const headers = provider.setHeaders({ tags: ['home'] } as CacheOptions, dummyRequest);

		expect(headers.has('Cache-Tag')).toBe(false);
		expect(warn).toHaveBeenCalledTimes(1);
	});

	it('warns and ignores swr by default', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const provider = factory({ hostingUrl: 'https://example.com' });

		const headers = provider.setHeaders({ maxAge: 60, swr: 30 } as CacheOptions, dummyRequest);

		expect(headers.get('Cache-Control')).toBe('public, s-maxage=60');
		expect(warn).toHaveBeenCalledTimes(1);
	});

	it('throws on tags when onUnsupported is error', () => {
		const provider = factory({ hostingUrl: 'https://example.com', onUnsupported: 'error' });

		expect(() => provider.setHeaders({ tags: ['home'] } as CacheOptions, dummyRequest)).toThrow();
	});

	it('is silent on tags and swr when onUnsupported is silent', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const provider = factory({ hostingUrl: 'https://example.com', onUnsupported: 'silent' });

		expect(() =>
			provider.setHeaders({ tags: ['home'], swr: 30 } as CacheOptions, dummyRequest),
		).not.toThrow();
		expect(warn).not.toHaveBeenCalled();
	});

	it('does not implement onRequest (CDN provider, not runtime provider)', () => {
		const provider = factory({ hostingUrl: 'https://example.com' });

		expect(provider.onRequest).toBeUndefined();
	});
});

describe('firebase cache provider: invalidate', () => {
	afterEach(() => {
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	it('purges the exact path via PURGE against hostingUrl', async () => {
		const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
		vi.stubGlobal('fetch', fetchMock);
		const provider = factory({ hostingUrl: 'https://example.com' });

		await provider.invalidate({ path: '/blog/post-1' } as InvalidateOptions);

		expect(fetchMock).toHaveBeenCalledTimes(1);
		const [url, init] = fetchMock.mock.calls[0] as [URL, RequestInit];
		expect(url.toString()).toBe('https://example.com/blog/post-1');
		expect(init.method).toBe('PURGE');
	});

	it('warns and no-ops on tags by default (no purge call)', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const fetchMock = vi.fn();
		vi.stubGlobal('fetch', fetchMock);
		const provider = factory({ hostingUrl: 'https://example.com' });

		await provider.invalidate({ tags: ['home'] } as InvalidateOptions);

		expect(fetchMock).not.toHaveBeenCalled();
		expect(warn).toHaveBeenCalledTimes(1);
	});

	it('throws on tags when onUnsupported is error, without attempting a purge', async () => {
		const fetchMock = vi.fn();
		vi.stubGlobal('fetch', fetchMock);
		const provider = factory({ hostingUrl: 'https://example.com', onUnsupported: 'error' });

		await expect(provider.invalidate({ tags: ['home'] } as InvalidateOptions)).rejects.toThrow();
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('treats an empty tags array the same as no tags, symmetric with setHeaders', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const fetchMock = vi.fn();
		vi.stubGlobal('fetch', fetchMock);
		const provider = factory({ hostingUrl: 'https://example.com', onUnsupported: 'error' });

		await expect(
			provider.invalidate({ tags: [] } as unknown as InvalidateOptions),
		).resolves.toBeUndefined();
		expect(warn).not.toHaveBeenCalled();
	});

	it('handles path and tags together, purging the path and applying the tag policy', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
		vi.stubGlobal('fetch', fetchMock);
		const provider = factory({ hostingUrl: 'https://example.com' });

		await provider.invalidate({ path: '/blog/post-1', tags: ['home'] } as InvalidateOptions);

		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(warn).toHaveBeenCalledTimes(1);
	});
});

describe('firebase cache provider: identity', () => {
	it('has a stable provider name', () => {
		const provider = factory({ hostingUrl: 'https://example.com' });

		expect(provider.name).toBe('firebase-hosting');
	});
});
