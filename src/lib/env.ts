import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';

/**
 * Typed server-only access to RSYWX environment configuration.
 *
 * IMPORTANT: this module must only be imported from server code
 * (e.g. `+page.server.ts`, `+layout.server.ts`, or server-only helpers).
 * `$env/dynamic/private` is only available server-side; it is never
 * intended to touch the browser bundle.
 */

const DEFAULT_API_BASE = 'https://api.rsywx.com/api/v1';

/**
 * Root-domain health endpoint — no version prefix, no auth.
 * `https://api.rsywx.com/health`
 */
const DEFAULT_API_ROOT = 'https://api.rsywx.com';

function requireEnv(name: string): string {
	const value = env[name];
	// Fail fast: a missing key in production should surface at build/boot time,
	// not as a confusing 401 at runtime.
	if (!value && !dev) {
		throw new Error(`Missing required environment variable: ${name}`);
	}
	return value ?? '';
}

export const api = {
	/** The API key sent in the `X-API-Key` header. Server-only. */
	get key(): string {
		return requireEnv('RSYWX_API_KEY');
	},

	/** Versioned base URL for all API calls (everything under /api/v1). */
	get base(): string {
		return env.RSYWX_API_BASE ?? DEFAULT_API_BASE;
	},

	/** Root domain for the auth-exempt /health liveness endpoint. */
	get root(): string {
		return DEFAULT_API_ROOT;
	}
};