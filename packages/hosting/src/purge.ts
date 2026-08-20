/**
 * Firebase Hosting's CDN purge is an undocumented, unauthenticated HTTP method
 * (`PURGE <hostingUrl><path>`) — see docs/adr/0001-purge-via-undocumented-firebase-endpoint.md.
 */
export async function purge(hostingUrl: string, path: string): Promise<void> {
	const url = new URL(path, hostingUrl);
	const response = await fetch(url, { method: 'PURGE' });

	if (!response.ok) {
		throw new Error(`Failed to purge ${url.toString()}: ${response.status} ${response.statusText}`);
	}
}
