import { seo } from '$lib/seo';
import type { DashboardData } from './+page.server';

export const load = (async ({ data }) => {
	return {
		...data,
		metadata: seo('任氏有无轩 — 首页', '藏书、读书笔记与书评的私人图书馆。')
	};
});