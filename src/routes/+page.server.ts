import {
	booksNewest,
	booksRandom,
	booksStatus,
	booksToday,
	booksLastVisited,
	wotd,
	qotd,
	latestReadings
} from '$lib/api';
import type { BookListItem, BooksStatus, ReadingItem, Wotd, Qotd, BookTodayItem, DateInfo } from '$lib/types';

export interface DashboardData {
	status?: BooksStatus;
	newest: BookListItem[];
	random: BookListItem[];
	lastVisited: BookListItem[];
	onThisDay: { items: BookTodayItem[]; yearsAgo: string; date_info?: DateInfo };
	wotd?: Wotd;
	qotd?: Qotd;
	latestReadings: ReadingItem[];
}

/**
 * Aggregates all dashboard widgets in parallel from the RSYWX API.
 * All calls are server-side (behind $env/dynamic/private) so the API key is
 * never shipped to the browser. Each widget is awaited with try/catch so a
 * single failing widget (e.g. /books/today on a leap-day edge) never takes
 * down the whole page.
 */
export async function load(): Promise<{ dashboard: Partial<DashboardData> }> {
	const settle = <T>(p: Promise<T>): Promise<T | undefined> =>
		p.then((v) => v).catch(() => undefined);

	const [status, newest, random, lastVisited, onToday, word, quote, latest] =
		await Promise.all([
			settle(booksStatus()),
			settle(booksNewest(5)),
			settle(booksRandom(5)),
			settle(booksLastVisited(10)),
			settle(booksToday()),
			settle(wotd()),
			settle(qotd()),
			settle(latestReadings(5))
		]);

	const onThisDay = onToday ?? { items: [] as BookTodayItem[], date_info: undefined };

	let yearsAgo = '';
	const first = onThisDay.items?.[0];
	if (first && typeof first.years_ago === 'number') {
		yearsAgo = `${first.years_ago} 年前`;
	}

	return {
		dashboard: {
			status,
			newest: newest ?? [],
			random: random ?? [],
			lastVisited: lastVisited ?? [],
			onThisDay: { items: onThisDay.items ?? [], yearsAgo, date_info: onThisDay.date_info },
			wotd: word,
			qotd: quote,
			latestReadings: latest ?? []
		}
	};
}