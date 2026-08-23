import { qotd } from '$lib/api';
import { json } from '@sveltejs/kit';

export async function GET() {
	return json(await qotd(true), {
		headers: { 'cache-control': 'no-store' }
	});
}
