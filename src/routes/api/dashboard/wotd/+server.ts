import { wotd } from '$lib/api';
import { json } from '@sveltejs/kit';

export async function GET() {
	return json(await wotd(true), {
		headers: { 'cache-control': 'no-store' }
	});
}
