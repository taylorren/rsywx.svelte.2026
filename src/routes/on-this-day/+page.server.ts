import { booksToday, wpPostsToday } from '$lib/api';
import { pageTitle } from '$lib/seo';

export async function load() {
	const [booksResult, posts] = await Promise.all([booksToday(), wpPostsToday()]);

	return {
		books: booksResult.items,
		dateInfo: booksResult.date_info,
		posts: posts.data,
		metadata: pageTitle('此日', '回顾在这一天购入的书籍与写下的文字。')
	};
}
