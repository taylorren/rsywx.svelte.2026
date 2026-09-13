import { redirect } from '@sveltejs/kit';
import { searchBooks } from '$lib/api';
import { pageTitle } from '$lib/seo';
import type { BookSearchType } from '$lib/types';

// An explicit bookid is a one-or-none lookup, not a search — it belongs to the
// detail page /books/{bookid}.html, so type=id redirects there.
const searchTypes = new Set<BookSearchType>(['author', 'title', 'tag']);

function positiveInteger(value: string | undefined): number | null {
	if (value === undefined) return 1;
	const parsed = Number(value);
	return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function load({ params }) {
	const { type, value, page: pageRaw } = params;
	// An explicit bookid is a one-or-none lookup: send it to the detail page
	// (the backend has no "id" list type).
	if (type === 'id' && /^\d+$/.test(value.trim())) {
		throw redirect(307, `/books/${value.trim()}.html`);
	}
	if (!searchTypes.has(type as BookSearchType)) throw redirect(307, '/books');
	const query = value.trim();
	if (!query) throw redirect(307, '/books');

	const page = positiveInteger(pageRaw);
	const base = `/books/${type}/${encodeURIComponent(query)}`;
	if (page === null || page === 1) throw redirect(307, base);

	const results = await searchBooks(type as BookSearchType, query, page);

	return {
		results,
		search: { type: type as BookSearchType, query },
		metadata: pageTitle('藏书', `搜索任氏有无轩的私人藏书：${query}。`)
	};
}
