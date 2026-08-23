/**
 * Selectable time ranges for the 访问趋势 chart on /stats.
 * Mirrors the range picker on rsywx.net/books/visits (最近7天/30天/90天/180天/一年).
 * Shared between the client component and the /api/stats/visits/[days] proxy
 * so the two can never drift apart.
 */
export const RANGE_OPTIONS = [
	{ days: 7, label: '最近7天' },
	{ days: 30, label: '最近30天' },
	{ days: 90, label: '最近90天' },
	{ days: 180, label: '最近180天' },
	{ days: 365, label: '最近一年' }
] as const;

/** Default range — the API's 30-day window returns 31 inclusive days of points. */
export const DEFAULT_RANGE_DAYS = 30;

export type RangeDays = (typeof RANGE_OPTIONS)[number]['days'];
