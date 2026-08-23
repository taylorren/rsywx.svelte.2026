import { reviews } from '$lib/api';
import { pageTitle } from '$lib/seo';

function positiveInteger(value: string | undefined): number {
	const parsed = Number(value);
	return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : 1;
}

export async function load({ params }) {
	const page = positiveInteger(params.page);
	const result = await reviews(page);

	return {
		reviews: result.items,
		pagination: result.pagination,
		metadata: pageTitle('读书', '任氏有无轩的读书笔记与书评。')
	};
}
