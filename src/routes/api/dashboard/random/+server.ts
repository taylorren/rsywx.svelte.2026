import { booksRandom } from '$lib/api';
import { json } from '@sveltejs/kit';

export async function GET() {
	return json(await booksRandom(5, true), {
		headers: { 'cache-control': 'no-store' }
	});
}
