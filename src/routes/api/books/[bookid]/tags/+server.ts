import { json } from '@sveltejs/kit';
import { api as apiEnv } from '$lib/env';

/**
 * Server-only proxy for `POST /books/{bookid}/tags`.
 *
 * The upstream API key must never reach the browser, so the SvelteKit
 * frontend posts here and this handler forwards to the RSYWX API.
 * On success it re-fetches the fresh book detail (?refresh=true) so the
 * client can show the authoritative tag list immediately, without waiting
 * for the 24h upstream cache to expire.
 */

const BOOKID_RE = /^\d{5}$/;
const MAX_TAGS = 10;
const MAX_TAG_LENGTH = 20;

export async function POST({ params, request }) {
	const { bookid } = params;
	if (!BOOKID_RE.test(bookid)) {
		return json({ success: false, message: '无效的书号。' }, { status: 400 });
	}

	const body = await request.json().catch(() => null);
	const raw: unknown[] = Array.isArray(body?.tags) ? body.tags : [];
	if (raw.length === 0) {
		return json({ success: false, message: '至少需要一个标签。' }, { status: 400 });
	}

	// Trim, drop empties/oversized, dedupe, cap at 10 per request.
	const tags = [
		...new Set(
			raw.map((t) => String(t).trim()).filter((t) => t.length > 0 && t.length <= MAX_TAG_LENGTH)
		)
	].slice(0, MAX_TAGS);

	if (tags.length === 0) {
		return json({ success: false, message: '标签不能为空，且不超过 20 个字符。' }, { status: 400 });
	}

	const upstream = await fetch(`${apiEnv.base}/books/${bookid}/tags`, {
		method: 'POST',
		headers: {
			'X-API-Key': apiEnv.key,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ tags })
	}).catch(() => null);

	if (!upstream) {
		return json({ success: false, message: '暂时无法连接藏书服务。' }, { status: 502 });
	}

	const result = (await upstream.json().catch(() => null)) as
		| { success?: boolean; message?: string }
		| null;

	if (!upstream.ok || !result || result.success === false) {
		return json(
			{ success: false, message: result?.message ?? '添加标签失败。' },
			{ status: upstream.ok ? 500 : 502 }
		);
	}

	// Re-fetch the fresh detail so the browser can render the authoritative list.
	let freshTags: string[] | null = null;
	const fresh = await fetch(`${apiEnv.base}/books/${bookid}?refresh=true`, {
		headers: { 'X-API-Key': apiEnv.key }
	}).catch(() => null);
	if (fresh && fresh.ok) {
		const freshBody = (await fresh.json().catch(() => null)) as
			| { success?: boolean; data?: { tags?: unknown } }
			| null;
		if (
			freshBody?.success === true &&
			Array.isArray(freshBody.data?.tags) &&
			freshBody.data.tags.every((t) => typeof t === 'string')
		) {
			freshTags = freshBody.data.tags;
		}
	}

	return json({ success: true, tags: freshTags ?? tags });
}
