import { browser } from '$app/environment';

/**
 * light-weight, typed localStorage wrapper.
 *
 * Purpose: remember "dynamics" in the page — i.e. UI state the user changes
 * or the page derives that should survive reloads/navigation:
 *   - theme (handled by ThemeToggle + app.html, but usable here too)
 *   - collapsed/expanded dashboard shelves
 *   - the persisted "on this day" date the user was viewing
 *   - a chosen sort/page in the browser
 *
 * These are small, non-critical preferences, so every call is defensive:
 * SSR returns the default, and storage errors are swallowed.
 */

const PREFIX = 'rsywx:';

export function getStore<T>(key: string): T | null {
	if (!browser) return null;
	try {
		const raw = localStorage.getItem(PREFIX + key);
		return raw === null ? null : (JSON.parse(raw) as T);
	} catch {
		return null;
	}
}

export function setStore<T>(key: string, value: T): void {
	if (!browser) return;
	try {
		localStorage.setItem(PREFIX + key, JSON.stringify(value));
	} catch {
		/* quota / privacy mode — ignore */
	}
}

/** Removes a stored key. */
export function clearStore(key: string): void {
	if (!browser) return;
	try {
		localStorage.removeItem(PREFIX + key);
	} catch {
		/* ignore */
	}
}

/**
 * getStore with an in-memory fallback so that during SSR the value is the
 * default, and after hydration it becomes the persisted value.
 */
export function stored<T>(key: string, fallback: T): T {
	if (!browser) return fallback;
	const v = getStore<T>(key);
	return v === null ? fallback : v;
}

export const KEYS = {
	theme: 'theme',
	onThisDayDate: 'on-this-day-date',
	collapsedShelves: 'collapsed-shelves',
	browserFilter: 'browser-filter'
} as const;