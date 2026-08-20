import { afterEach, describe, expect, it, vi } from 'vitest';
import { purge } from './purge.js';

describe('purge', () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('sends a PURGE request to the exact path under hostingUrl', async () => {
		const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
		vi.stubGlobal('fetch', fetchMock);

		await purge('https://example.com', '/blog/post-1');

		expect(fetchMock).toHaveBeenCalledTimes(1);
		const [url, init] = fetchMock.mock.calls[0] as [URL, RequestInit];
		expect(url.toString()).toBe('https://example.com/blog/post-1');
		expect(init.method).toBe('PURGE');
	});

	it('joins hostingUrl with a trailing slash and path correctly', async () => {
		const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
		vi.stubGlobal('fetch', fetchMock);

		await purge('https://example.com/', '/blog/post-1');

		const [url] = fetchMock.mock.calls[0] as [URL, RequestInit];
		expect(url.toString()).toBe('https://example.com/blog/post-1');
	});

	it('throws with status information when the response is not ok', async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValue(new Response(null, { status: 500, statusText: 'Internal Server Error' }));
		vi.stubGlobal('fetch', fetchMock);

		await expect(purge('https://example.com', '/blog/post-1')).rejects.toThrow(
			/500.*Internal Server Error/,
		);
	});

	it('resolves without throwing when the response is ok', async () => {
		const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
		vi.stubGlobal('fetch', fetchMock);

		await expect(purge('https://example.com', '/blog/post-1')).resolves.toBeUndefined();
	});
});
