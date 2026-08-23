/**
 * RSYWX API — typed models
 * Hand-typed against the current API reference (`doc/API.md`).
 *
 * Conventions from the backend:
 * - Dates are plain strings: `YYYY-MM-DD` or `YYYY-MM-DD HH:mm:ss`.
 * - `bookid` is a zero-padded 5-digit string; `id` is the numeric integer.
 * - `cover_uri` is an absolute URL when present.
 * - `/books/related` intentionally omitted (PENDING / not implemented).
 */

/* ---------------------------------- Envelope -------------------------------- */

export interface ApiEnvelope<T> {
	success: boolean;
	data: T;
	cached: boolean;
	message?: string;
}

export interface ApiPaginatedEnvelope<T> extends ApiEnvelope<T> {
	pagination: Pagination;
}

export interface ApiDateEnvelope<T> extends ApiEnvelope<T> {
	date_info?: DateInfo;
}

export interface Pagination {
	current_page: number;
	total_pages: number;
	total_results: number;
	per_page: number;
}

/* ---------------------------------- System --------------------------------- */

export interface HealthResponse {
	success: boolean;
	message: string;
	timestamp: string;
}

/* ----------------------------------- Books --------------------------------- */

/** Collection statistics from `/books/status`. */
export interface BooksStatus {
	total_books: number;
	total_pages: number;
	total_kwords: number;
	total_visits: number;
}

/**
 * Compact "book" shape used by `/books/latest`, `/books/random`,
 * `/books/last_visited`, `/books/forgotten`, `data[]` of `/books/list`,
 * and `/books/today`. Verified against live responses.
 *
 * Real-world field types (confirmed on the wire):
 * - `translated` is `0` | `1` (number), not boolean.
 * - `price` is a numeric string (e.g. `"59.00"`), or null.
 * - `cover_uri` is an absolute URL when present.
 */
export interface BookListItem {
	id: number;
	bookid: string;
	title: string;
	author: string;
	translated: number;
	copyrighter: string | null;
	region: string | null;
	location: string | null;
	purchdate: string;
	tags: string[];
	cover_uri: string | null;
	price: string | null;
	place_name: string | null;
	publisher_name: string | null;
	/** Present on `/books/last_visited`. */
	last_visited?: string | null;
	/** Present on `/books/last_visited`. */
	visit_country?: string | null;
	/** Present on `/books/last_visited`. */
	total_visits?: number;
	/** Present on `/books/forgotten`. */
	days_since_visit?: number;
}

/** Full record from `/books/{bookid}`. */
export interface BookDetail extends BookListItem {
	pubdate: string | null;
	printdate: string | null;
	ver: string | null;
	deco: string | null;
	isbn: string | null;
	category: string | null;
	ol: string | null;
	kword: number | null;
	page: number | null;
	intro: string | null;
	instock: boolean;
	reviews: unknown[];
	total_visits: number;
	last_visited: string | null;
}

/** Type discriminator for `/books/list/{type}/{value}/{page}`. */
export type BookSearchType = 'author' | 'title' | 'tag' | 'misc' | 'id';

export interface BookmarksSearchResult {
	items: BookListItem[];
	pagination: Pagination;
}

/** `/books/popular` / `/books/unpopular` item shape (visit-heavy, sparse). */
export interface BookPopularItem {
	id: number;
	bookid: string;
	title: string;
	author: string;
	total_visits: number;
	last_visited: string;
	purchdate: string;
	place_name?: string | null;
}

/** Item from `/books/today` — "bought this day N years ago". Same shape as a list item plus `years_ago`. */
export interface BookTodayItem extends BookListItem {
	years_ago: number;
}

export interface DateInfo {
	requested_date: string;
	month_day: string;
	is_today: boolean;
}

/** Visit-trend point from `/books/visit_history`. */
export interface VisitPoint {
	date: string;
	visit_count: number;
	day_of_week: string;
}

export interface VisitHistory {
	data: VisitPoint[];
	period_info: {
		start_date: string;
		end_date: string;
		total_days: number;
		total_visits: number;
	};
}

/* ------------------------------ Miscellaneous ------------------------------- */

export interface Wotd {
	id: number;
	word: string;
	meaning: string;
	sentence: string;
	type: string;
}

export interface Qotd {
	id: number;
	quote: string;
	source: string;
}

export interface CurrentWeather {
	location: string;
	temperature: string;
	feels_like: string;
	condition: string;
	humidity: string;
	pressure: string;
	wind_speed: string;
	update_time: string;
}

export interface ForecastDay {
	date: string;
	temp_max: string;
	temp_min: string;
	condition_day: string;
	condition_night: string;
}

export interface WeatherForecast {
	location: string;
	forecast: ForecastDay[];
}

/* --------------------------------- Readings -------------------------------- */

export interface ReadingsSummary {
	books_read: number;
	reviews_written: number;
	reading_period: {
		earliest_date: string;
		latest_date: string;
		total_days: number;
	};
}

export interface ReadingItem {
	title: string;
	datein: string;
	uri: string;
	feature: string | null;
	bookid: string;
	book_title: string;
	cover_uri: string | null;
}

/* --------------------------------- WordPress -------------------------------- */

export interface WpPostToday {
	ID: number;
	post_title: string;
	post_name: string;
	post_excerpt: string;
	post_date: string;
	post_status: string;
	author: string;
	years_ago: number;
	permalink: string;
	/** Featured image URL from the WordPress REST API, or null. */
	feature_image: string | null;
}

export interface WpPostsToday {
	data: WpPostToday[];
	date_info: DateInfo;
	count: number;
}