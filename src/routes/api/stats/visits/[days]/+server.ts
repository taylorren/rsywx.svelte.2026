import { visitHistory } from '$lib/api';
import { RANGE_OPTIONS } from '$lib/visits';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * Server-only proxy for /books/visit_history?days=N so the 访问趋势 chart can
 * switch time ranges client-side without ever exposing the API key.
 * Mirrors the range picker on rsywx.net/books/visits (7/30/90/180/365 days).
 */
export const GET: RequestHandler = async ({ params }) => {
	const days = Number(params.days);
	if (!RANGE_OPTIONS.some((r) => r.days === days)) {
		return json(
			{ error: `days must be one of ${RANGE_OPTIONS.map((r) => r.days).join(', ')}` },
			{ status: 400 }
		);
	}
	return json(await visitHistory(days), {
		headers: { 'cache-control': 'no-store' }
	});
};
