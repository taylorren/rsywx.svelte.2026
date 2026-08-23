export interface SeoMeta {
	title: string;
	description: string;
	/**
	 * Optional structured title (e.g. "隐形的城市 – 任氏有无轩") passed to the
	 * page-level <svelte:head>; when omitted callers use the builder default.
	 */
	titleTemplate?: string;
}

/**
 * Small helper for constructing per-route SEO metadata in a consistent way.
 *
 * Usage — from a `+page.ts` loader:
 *   export function load({ data }) { return { metadata: seoTitle('隐形的城市', '…') }; }
 *
 * SvelteKit 2.x injects the returned `metadata` into <svelte:head> on the page.
 * Site-wide defaults (brand + description) are set once in +layout.svelte.
 */
const BRAND = '任氏有无轩';

export function seo(title: string, description: string, options: Partial<SeoMeta> = {}): SeoMeta {
	return {
		title: options.titleTemplate ? `${title} – ${BRAND}` : title,
		description,
		...options
	};
}

/** Typical page title a template would use before the brand. */
export function pageTitle(route: string, description: string): SeoMeta {
	return seo(route, description, { titleTemplate: `${route} – ${BRAND}` });
}