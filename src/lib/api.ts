import { api as apiEnv } from './env';
import type {
	BookDetail,
	BookListItem,
	BookPopularItem,
	BookTodayItem,
	BooksStatus,
	HealthResponse,
	Pagination,
	Qotd,
	CurrentWeather,
	ReadingsSummary,
	ReadingItem,
	VisitHistory,
	WeatherForecast,
	Wotd,
	WpPostsToday,
	ApiEnvelope,
	ApiPaginatedEnvelope,
	BookSearchType,
	DateInfo
} from './types';

/**
 * Typed client for the RSYWX API.
 * Server-only: reads the API key from env and sends it as X-API-Key.
 * Callers should never see raw fetch/envelope concerns — they get typed `data`.
 */

interface RequestOptions {
	/** Force a cache refresh on the backend (?refresh=true). */
	refresh?: boolean;
	/** Query params, environment encoded. */
	query?: Record<string, string | number | boolean | undefined>;
}

function buildUrl(
	base: string,
	path: string,
	{ refresh, query }: RequestOptions = {}
): string {
	const url = new URL(base + path);
	if (refresh) url.searchParams.set('refresh', 'true');
	if (query) {
		for (const [k, v] of Object.entries(query)) {
			if (v !== undefined) url.searchParams.set(k, String(v));
		}
	}
	return url.toString();
}

async function request<T>(
	base: string,
	path: string,
	opts: RequestOptions = {},
	{ key = true } = {}
): Promise<T> {
	const res = await fetch(buildUrl(base, path, opts), {
		headers: key ? { 'X-API-Key': apiEnv.key } : undefined
	});

	const body = (await res.json().catch(() => null)) as
		| ApiEnvelope<unknown>
		| null;

	if (!res.ok || !body || body.success === false) {
		throw new Error(body?.message ?? `Request failed (HTTP ${res.status})`);
	}

	if (body.success === true && res.ok) {
		return body.data as T;
	}

	throw new Error(`Unexpected response (HTTP ${res.status})`);
}

async function paginatedRequest<T>(
	path: string,
	opts: RequestOptions = {}
): Promise<{ items: T; pagination: Pagination }> {
	const body = (await fetch(buildUrl(apiEnv.base, path, opts), {
		headers: { 'X-API-Key': apiEnv.key }
	}).then((r) => r.json())) as ApiPaginatedEnvelope<T>;
	if (body.success === false) throw new Error(body.message ?? 'Request failed');
	return { items: body.data, pagination: body.pagination };
}

/** Bare liveness ping at the root domain — no auth, no version prefix. */
export function health(): Promise<HealthResponse> {
	return request<HealthResponse>(
		apiEnv.root,
		'/health',
		{},
		{ key: false }
	);
}

/* --------------------------------- Books ----------------------------------- */

export function booksStatus(refresh = false): Promise<BooksStatus> {
	return request<BooksStatus>(apiEnv.base, '/books/status', { refresh });
}

export function bookDetail(
	bookid: string,
	refresh = false
): Promise<BookDetail> {
	return request<BookDetail>(apiEnv.base, `/books/${bookid}`, { refresh });
}

export function booksNewest(count = 5): Promise<BookListItem[]> {
	return request<BookListItem[]>(
		apiEnv.base,
		`/books/latest/${count}`
	);
}

export function booksRandom(count = 5): Promise<BookListItem[]> {
	return request<BookListItem[]>(apiEnv.base, `/books/random/${count}`);
}

export function booksLastVisited(count = 10): Promise<BookListItem[]> {
	return request<BookListItem[]>(
		apiEnv.base,
		`/books/last_visited/${count}`
	);
}

export function booksForgotten(count = 10): Promise<BookListItem[]> {
	return request<BookListItem[]>(apiEnv.base, `/books/forgotten/${count}`);
}

export function booksPopular(
	count: number
): Promise<BookPopularItem[]> {
	return request<BookPopularItem[]>(apiEnv.base, `/books/popular/${count}`);
}

export function booksToday(
	month?: number,
	day?: number
): Promise<{ items: BookTodayItem[]; date_info?: DateInfo }> {
	const path =
		month !== undefined && day !== undefined
			? `/books/today/${month}/${day}`
			: '/books/today';
	return request<{ items: BookTodayItem[]; date_info?: DateInfo }>(
		apiEnv.base,
		path
	);
}

export function searchBooks(
	type: BookSearchType = 'id',
	value = '',
	page = 1,
	refresh = false
): Promise<{ items: BookListItem[]; pagination: Pagination }> {
	const encoded = encodeURIComponent(value);
	const path = `/books/list/${type}/${encoded}/${page}`;
	return paginatedRequest<BookListItem[]>(path, { refresh });
}

export function visitHistory(days = 30): Promise<VisitHistory> {
	return request<VisitHistory>(apiEnv.base, '/books/visit_history', {
		query: { days }
	});
}

/* ------------------------------ Miscellaneous ------------------------------- */

export function wotd(): Promise<Wotd> {
	return request<Wotd>(apiEnv.base, '/misc/wotd');
}

export function qotd(): Promise<Qotd> {
	return request<Qotd>(apiEnv.base, '/misc/qotd');
}

export function currentWeather(
	location: string
): Promise<CurrentWeather> {
	return request<CurrentWeather>(apiEnv.base, '/misc/weather/current', {
		query: { location }
	});
}

export function weatherForecast(
	location: string,
	days = 3
): Promise<WeatherForecast> {
	return request<WeatherForecast>(apiEnv.base, '/misc/weather/forecast', {
		query: { location, days }
	});
}

/* --------------------------------- Readings -------------------------------- */

export function readingsSummary(): Promise<ReadingsSummary> {
	return request<ReadingsSummary>(apiEnv.base, '/readings/summary');
}

export function latestReadings(count = 5): Promise<ReadingItem[]> {
	return request<ReadingItem[]>(apiEnv.base, `/readings/latest/${count}`);
}

export function reviews(
	page = 1
): Promise<{ items: ReadingItem[]; pagination: Pagination }> {
	return paginatedRequest<ReadingItem[]>(`/readings/reviews/${page}`);
}

/* --------------------------------- WordPress -------------------------------- */

export function wpPostsToday(
	month?: number,
	day?: number
): Promise<WpPostsToday> {
	const path =
		month !== undefined && day !== undefined
			? `/wp/posts/today/${month}/${day}`
			: '/wp/posts/today';
	return request<WpPostsToday>(apiEnv.base, path);
}