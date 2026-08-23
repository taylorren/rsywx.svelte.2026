import { redirect } from '@sveltejs/kit';
import { searchBooks } from '$lib/api';
import { pageTitle } from '$lib/seo';
import type { BookSearchType } from '$lib/types';

const searchTypes = new Set<BookSearchType>(['author', 'title', 'tag']);

function positiveInteger(value: string | undefined): number | null {
	if (value === undefined) return 1;
	const parsed = Number(value);
	return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function load({ params, url }) {
	// Legacy query-param URLs (old ?type=&q=&page= links) → canonical paths
	const legacyQuery = url.searchParams.get('q')?.trim();
	if (legacyQuery) {
		const requestedType = url.searchParams.get('type') ?? 'title';
		const type = searchTypes.has(requestedType as BookSearchType)
			? (requestedType as BookSearchType)
			: 'title';
		throw redirect(307, `/books/${type}/${encodeURIComponent(legacyQuery)}`);
	}
	const legacyPage = url.searchParams.get('page');
	if (legacyPage) {
		const page = positiveInteger(legacyPage);
		throw redirect(307, page !== null && page > 1 ? `/books/${page}` : '/books');
	}

	const page = positiveInteger(params.page);
	if (page === null) throw redirect(307, '/books');
	// Canonicalize /books/1 → /books (only when a page segment was present)
	if (params.page !== undefined && page === 1) throw redirect(307, '/books');

	const results = await searchBooks('title', '', page);

	return {
		results,
		search: { type: 'title' as const, query: '' },
		metadata: pageTitle('藏书', '浏览任氏有无轩的私人藏书。')
	};
}
