import type { HealthResponse } from './types';

/**
 * Bare liveness ping — deliberately isolated from `api.ts`.
 *
 * `api.ts` reads the API key from server-only env; importing it into any
 * client component would pull $env/dynamic/private into the browser bundle,
 * which SvelteKit forbids. Health needs no key and runs from the browser, so it
 * lives in its own key-free module.
 */

const root = import.meta.env.VITE_RSYWX_API_ROOT ?? 'https://api.rsywx.com';

export async function health(): Promise<HealthResponse> {
	const res = await fetch(`${root}/health`);
	if (!res.ok) throw new Error(`Health check failed (HTTP ${res.status})`);
	const body = (await res.json()) as HealthResponse;
	return body;
}