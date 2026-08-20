import { describe, expect, it, vi } from 'vitest';
import { handleUnsupported } from './policy.js';

describe('handleUnsupported', () => {
	it('does nothing and does not log when policy is silent', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

		expect(() => handleUnsupported('silent', 'tags are not supported')).not.toThrow();
		expect(warn).not.toHaveBeenCalled();

		warn.mockRestore();
	});

	it('logs a warning and does not throw when policy is warn', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

		expect(() => handleUnsupported('warn', 'tags are not supported')).not.toThrow();
		expect(warn).toHaveBeenCalledTimes(1);
		expect(warn.mock.calls[0]?.[0]).toContain('tags are not supported');

		warn.mockRestore();
	});

	it('throws with the given message when policy is error', () => {
		expect(() => handleUnsupported('error', 'tags are not supported')).toThrow(
			'tags are not supported',
		);
	});
});
