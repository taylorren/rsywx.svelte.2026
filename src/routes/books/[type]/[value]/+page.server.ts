import { redirect } from '@sveltejs/kit';
import { searchBooks } from '$lib/api';
import { pageTitle } from '$lib/seo';
import type { BookSearchType } from '$lib/types';

const searchTypes = new Set<BookSearchType>(['author', 'title', 'tag']);

export async function load({ params }) {
	const { type, value } = params;
	if (!searchTypes.has(type as BookSearchType)) throw redirect(307, '/books');
	const query = value.trim();
	if (!query) throw redirect(307, '/books');

	const results = await searchBooks(type as BookSearchType, query, 1);

	return {
		results,
		search: { type: type as BookSearchType, query },
		metadata: pageTitle('藏书', `搜索任氏有无轩的私人藏书：${query}。`)
	};
}
