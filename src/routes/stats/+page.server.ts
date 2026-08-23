import {
	booksStatus,
	readingsSummary,
	visitHistory,
	booksLastVisited,
	booksForgotten,
	booksPopular,
	booksUnpopular
} from '$lib/api';
import { pageTitle } from '$lib/seo';
import type {
	BooksStatus,
	ReadingsSummary,
	VisitHistory,
	BookListItem,
	BookPopularItem
} from '$lib/types';

export interface StatsData {
	status?: BooksStatus;
	summary?: ReadingsSummary;
	history?: VisitHistory;
	lastVisited?: BookListItem[];
	forgotten?: BookListItem[];
	popular?: BookPopularItem[];
	unpopular?: BookPopularItem[];
}

/**
 * Aggregates all collection-stat widgets in parallel.
 * All calls are server-side behind $env/dynamic/private, so the API key never
 * reaches the browser. Each widget is settled individually so a failing
 * endpoint degrades the page gracefully instead of killing it.
 */
export async function load(): Promise<{
	stats: StatsData;
	metadata: ReturnType<typeof pageTitle>;
}> {
	const settle = <T>(p: Promise<T>): Promise<T | undefined> =>
		p.then((v) => v).catch(() => undefined);

	const [status, summary, history, lastVisited, forgotten, popular, unpopular] =
		await Promise.all([
			settle(booksStatus()),
			settle(readingsSummary()),
			settle(visitHistory(30)),
			settle(booksLastVisited(10)),
			settle(booksForgotten(10)),
			settle(booksPopular(10)),
			settle(booksUnpopular(10))
		]);

	return {
		stats: { status, summary, history, lastVisited, forgotten, popular, unpopular },
		metadata: pageTitle('统计', '任氏有无轩的藏书与阅读统计。')
	};
}
