export type UnsupportedPolicy = 'silent' | 'warn' | 'error';

export function handleUnsupported(policy: UnsupportedPolicy, message: string): void {
	switch (policy) {
		case 'error':
			throw new Error(message);
		case 'warn':
			console.warn(`[@astro-firebase/hosting] ${message}`);
			break;
		case 'silent':
			break;
	}
}
