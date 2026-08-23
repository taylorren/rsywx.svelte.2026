import { ApiError, bookDetail } from '$lib/api';
import { pageTitle } from '$lib/seo';
import { error } from '@sveltejs/kit';

const NOT_FOUND_MESSAGE = '未找到这本书';

export async function load({ params }) {
	if (!/^\d{5}$/.test(params.bookid)) {
		error(404, NOT_FOUND_MESSAGE);
	}

	let book;
	try {
		book = await bookDetail(params.bookid);
	} catch (e) {
		// A well-formed bookid that returns 0 records from the API → 404,
		// not a 500. Anything else (API down, transient 5xx) still surfaces.
		if (e instanceof ApiError && e.status === 404) {
			error(404, NOT_FOUND_MESSAGE);
		}
		throw e;
	}

	return {
		book,
		metadata: pageTitle(book.title, `${book.author || '佚名'}的藏书详情。`)
	};
}
