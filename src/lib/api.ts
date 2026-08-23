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
	VisitPoint,
	WeatherForecast,
	Wotd,
	WpPostsToday,
	WpPostToday,
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

export function booksRandom(count = 5, refresh = false): Promise<BookListItem[]> {
	return request<BookListItem[]>(apiEnv.base, `/books/random/${count}`, { refresh });
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

export function booksUnpopular(
	count: number
): Promise<BookPopularItem[]> {
	return request<BookPopularItem[]>(apiEnv.base, `/books/unpopular/${count}`);
}

export async function booksToday(
	month?: number,
	day?: number
): Promise<{ items: BookTodayItem[]; date_info?: DateInfo }> {
	const path =
		month !== undefined && day !== undefined
			? `/books/today/${month}/${day}`
			: '/books/today';
	const body = (await fetch(buildUrl(apiEnv.base, path, {}), {
		headers: { 'X-API-Key': apiEnv.key }
	}).then((r) => r.json())) as ApiEnvelope<BookTodayItem[]> & { date_info?: DateInfo };
	if (body.success === false) throw new Error(body.message ?? 'Request failed');
	return { items: body.data ?? [], date_info: body.date_info };
}

export function searchBooks(
	type: BookSearchType = 'id',
	value = '',
	page = 1,
	refresh = false
): Promise<{ items: BookListItem[]; pagination: Pagination }> {
	// Empty query → unfiltered list: /books/list/{page}
	const encoded = encodeURIComponent(value.trim());
	const path = encoded
		? `/books/list/${type}/${encoded}/${page}`
		: `/books/list/${page}`;
	return paginatedRequest<BookListItem[]>(path, { refresh });
}

export async function visitHistory(
	days = 30
): Promise<VisitHistory> {
	const body = (await fetch(buildUrl(apiEnv.base, '/books/visit_history', { query: { days } }), {
		headers: { 'X-API-Key': apiEnv.key }
	}).then((r) => r.json())) as ApiEnvelope<VisitPoint[]> & {
		period_info?: VisitHistory['period_info'];
	};
	if (body.success === false) throw new Error(body.message ?? 'Request failed');
	return {
		data: body.data ?? [],
		period_info: body.period_info ?? {
			start_date: '',
			end_date: '',
			total_days: 0,
			total_visits: 0
		}
	};
}

/* ------------------------------ Miscellaneous ------------------------------- */

export function wotd(refresh = false): Promise<Wotd> {
	return request<Wotd>(apiEnv.base, '/misc/wotd', { refresh });
}

export function qotd(refresh = false): Promise<Qotd> {
	return request<Qotd>(apiEnv.base, '/misc/qotd', { refresh });
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

const WP_REST = 'https://blog.rsywx.net/wp-json/wp/v2';

/** In-memory cache: month/day → { updatedAt, postUrls: Map<postId, url|null> } */
const wpImageCache = new Map<string, { at: number; postUrls: Map<number, string | null> }>();
const WP_IMAGE_TTL = 15 * 60 * 1000; // 15 minutes

/**
 * Resolve featured images for posts via the WordPress REST API.
 * Batched (one posts query + one media query) and cached; any failure
 * leaves `feature_image` null and the UI falls back to a default image.
 */
async function resolvePostImages(posts: WpPostToday[], key: string): Promise<void> {
	if (posts.length === 0) return;
	const cached = wpImageCache.get(key);
	const now = Date.now();
	if (cached && now - cached.at < WP_IMAGE_TTL) {
		for (const post of posts) post.feature_image = cached.postUrls.get(post.ID) ?? null;
		return;
	}

	const mediaUrls = new Map<number, string | null>(); // mediaId → url
	const postToMedia = new Map<number, number | undefined>(); // postId → mediaId
	const ids = posts.map((p) => p.ID).join(',');
	try {
		// 1) featured_media id per post (single batched request)
		const postsRes = await fetch(
			`${WP_REST}/posts?include=${ids}&per_page=100&_fields=id,featured_media`,
			{ headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(6000) }
		);
		if (!postsRes.ok) throw new Error(`WP posts ${postsRes.status}`);
		const postList = (await postsRes.json()) as { id: number; featured_media?: number }[];
		for (const p of postList) postToMedia.set(p.id, p.featured_media);
		const mediaIds = [...new Set(postList.map((p) => p.featured_media).filter((m) => m))].join(
			','
		);

		if (mediaIds) {
			// 2) source URLs for those media (single batched request)
			const mediaRes = await fetch(
				`${WP_REST}/media?include=${mediaIds}&per_page=100&_fields=id,source_url,media_details`,
				{ headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(6000) }
			);
			if (mediaRes.ok) {
				const mediaList = (await mediaRes.json()) as {
					id: number;
					source_url?: string;
					media_details?: { sizes?: Record<string, { source_url?: string }> };
				}[];
				for (const m of mediaList) {
					const url =
						m.media_details?.sizes?.medium_large?.source_url ?? m.source_url ?? null;
					mediaUrls.set(m.id, url);
				}
			}
		}
	} catch (e) {
		// Any WP failure → keep all null; UI falls back to the default image.
		console.error('[wpPostImages] enrichment failed:', e);
	}

	// postId → url (via the post→media mapping), then cache that resolved view.
	const postUrls = new Map<number, string | null>();
	for (const post of posts) {
		const mediaId = postToMedia.get(post.ID);
		postUrls.set(post.ID, mediaId ? (mediaUrls.get(mediaId) ?? null) : null);
	}
	wpImageCache.set(key, { at: now, postUrls });
	for (const post of posts) post.feature_image = postUrls.get(post.ID) ?? null;
}

export async function wpPostsToday(
	month?: number,
	day?: number
): Promise<WpPostsToday> {
	const path =
		month !== undefined && day !== undefined
			? `/wp/posts/today/${month}/${day}`
			: '/wp/posts/today';
	const body = (await fetch(buildUrl(apiEnv.base, path, {}), {
		headers: { 'X-API-Key': apiEnv.key }
	}).then((r) => r.json())) as ApiEnvelope<WpPostToday[]> & {
		date_info?: DateInfo;
		count?: number;
	};
	if (body.success === false) throw new Error(body.message ?? 'Request failed');
	const posts: WpPostToday[] = (body.data ?? []).map((p) => ({
		...p,
		feature_image: null
	}));
	await resolvePostImages(posts, `${month ?? 0}/${day ?? 0}`);
	return {
		data: posts,
		date_info: body.date_info as DateInfo,
		count: body.count ?? 0
	};
}