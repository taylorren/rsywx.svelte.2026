import { bookDetail } from '$lib/api';
import { pageTitle } from '$lib/seo';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
	if (!/^\d{5}$/.test(params.bookid)) {
		error(404, '未找到这本书');
	}

	const book = await bookDetail(params.bookid);

	return {
		book,
		metadata: pageTitle(book.title, `${book.author || '佚名'}的藏书详情。`)
	};
}
