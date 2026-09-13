#!/usr/bin/env node
/**
 * Functional test suite for the RSYWX frontend.
 *
 * Exercises every route and server-only API proxy against a running instance
 * (dev, preview, or production) by asserting HTTP status codes and stable,
 * server-rendered content markers. The suite is self-contained — Node 20+
 * native `fetch` only, no framework installed.
 *
 * Run:
 *   node scripts/functional-test.mjs                      # default http://localhost:5173
 *   node scripts/functional-test.mjs http://192.168.1.5   # against a remote host
 *   BASE_URL=https://staging.example.com node scripts/functional-test.mjs
 *
 * Exit code is 0 when every test passes, 1 otherwise.
 */

const BASE_URL = (process.env.BASE_URL ?? process.argv[2] ?? 'http://localhost:5173').replace(
	/\/+$/,
	''
);

const TIMEOUT_MS = 20000;

/* ------------------------------ Test harness ------------------------------ */

const results = [];

function assert(cond, msg) {
	if (!cond) throw new Error(msg);
}

async function test(name, fn) {
	try {
		await fn();
		results.push({ name, pass: true });
		console.log(`\x1b[32m✓\x1b[0m ${name}`);
	} catch (err) {
		results.push({ name, pass: false, err });
		console.log(`\x1b[31m✗\x1b[0m ${name} — ${err.message}`);
	}
}

/**
 * Fetch helper that returns the Response plus the raw body text.
 * Redirects are NOT followed so redirect assertions can inspect Location.
 */
async function req(path, { method = 'GET', headers = {}, body } = {}) {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
	try {
		const res = await fetch(BASE_URL + path, {
			method,
			headers,
			body,
			redirect: 'manual',
			signal: controller.signal
		});
		const text = await res.text();
		return { res, text, json: () => safeJson(text) };
	} finally {
		clearTimeout(timer);
	}
}

function safeJson(text) {
	try {
		return JSON.parse(text);
	} catch {
		return null;
	}
}

function isRedirect(status) {
	return status === 301 || status === 302 || status === 307 || status === 308;
}
/* ------------------------------ Test helpers ------------------------------ */

/** Decode the `Location` header (if any) into a comparable pathname. */
function locationPath(res) {
	const loc = res.headers.get('location');
	if (!loc) return '';
	try {
		return decodeURIComponent(new URL(loc, BASE_URL).pathname);
	} catch {
		return loc.split('?')[0];
	}
}

function assertStatus(res, expected, what) {
	assert(isRedirect(expected) === isRedirect(res.status), `${what}: status class mismatch`);
	assert(res.status === expected, `${what}: expected HTTP ${expected}, got ${res.status}`);
}

/** GET a path, assert the exact status, return the { res, text } pair. */
async function get(path, status, what = path) {
	const r = await req(path);
	assertStatus(r.res, status, what);
	return r;
}

/** GET a path and assert a 307 redirection to `expectedPath`. */
async function expectRedirect(path, expected, what = path) {
	const r = await req(path);
	assertStatus(r.res, 307, what);
	assert(
		locationPath(r.res) === expected,
		`${what}: expected redirect to "${expected}", got "${locationPath(r.res)}"`
	);
}

/* -------------------------- Site-wide / static ---------------------------- */

await test('base is reachable and renders the homepage shell', async () => {
	const r = await req('/');
	assertStatus(r.res, 200, 'GET /');
	assert(r.text.includes('任氏有无轩'), 'homepage should render the brand name');
	assert(r.text.includes('我的书房'), 'homepage should render the 我的书房 heading');
});

await test('favicon and core static assets are served', async () => {
	await get('/images/favicon.ico', 200, 'GET /images/favicon.ico');
	await get('/images/logo.svg', 200, 'GET /images/logo.svg');
	await get('/robots.txt', 200, 'GET /robots.txt');
	await get('/site.webmanifest', 200, 'GET /site.webmanifest');
});

await test('site.webmanifest is valid JSON with the correct short_name', async () => {
	const r = await req('/site.webmanifest');
	assertStatus(r.res, 200, 'GET /site.webmanifest');
	const manifest = r.json();
	assert(manifest && manifest.short_name === '有无轩', 'short_name should be 有无轩');
});
/* ------------------------------- 藏书 (/books) ---------------------------- */

await test('/books renders the collection heading', async () => {
	const r = await get('/books', 200, 'GET /books');
	assert(r.text.includes('藏书'), '/books should render 藏书');
	assert(r.text.includes('全部藏书'), '/books should render 全部藏书');
});

await test('/books/1 canonicalizes to /books', async () => {
	await expectRedirect('/books/1', '/books');
});

await test('/books/0 canonicalizes to /books', async () => {
	await expectRedirect('/books/0', '/books');
});

await test('/books/abc (non-numeric) canonicalizes to /books', async () => {
	await expectRedirect('/books/abc', '/books');
});

await test('/books?page=1 canonicalizes to /books', async () => {
	await expectRedirect('/books?page=1', '/books');
});

await test('/books?page=0 canonicalizes to /books', async () => {
	await expectRedirect('/books?page=0', '/books');
});

await test('/books?page=5 canonicalizes to /books/5', async () => {
	await expectRedirect('/books?page=5', '/books/5');
});

await test('/books?q=… canonicalizes to /books/title/<q>', async () => {
	await expectRedirect('/books?q=foo', '/books/title/foo');
});

await test('/books?type=author&q=… canonicalizes to /books/author/<q>', async () => {
	await expectRedirect('/books?type=author&q=村上春树', '/books/author/村上春树');
});

await test('/books?type=<invalid>&q=… falls back to title', async () => {
	await expectRedirect('/books?type=wat&q=foo', '/books/title/foo');
});

/* --------------------- 藏书 search routes (/books/<t>/<v>) ---------------- */

await test('/books/title/<q> search renders 藏书', async () => {
	const r = await get('/books/title/%E6%9D%91%E4%B8%8A', 200, 'GET /books/title/…');
	assert(r.text.includes('藏书'), 'search page should render 藏书');
});

await test('/books/author/<q> search renders 藏书', async () => {
	await get('/books/author/%E5%B0%84%E9%9B%95', 200, 'GET /books/author/…');
});

await test('/books/tag/<q> search renders 藏书', async () => {
	await get('/books/tag/%E7%A7%91%E5%B9%BB', 200, 'GET /books/tag/…');
});

await test('/books/<invalid-type>/value redirects to /books', async () => {
	await expectRedirect('/books/wat/foo', '/books');
});

await test('/books/title (empty value) redirects to /books', async () => {
	await expectRedirect('/books/title', '/books');
});

await test('/books/title/ (trailing slash) normalizes via 308', async () => {
	const r = await req('/books/title/');
	assertStatus(r.res, 308, 'GET /books/title/');
	assert(locationPath(r.res) === '/books/title', 'trailing slash should normalize to /books/title');
});

await test('/books/title/foo/1 canonicalizes to /books/title/foo', async () => {
	await expectRedirect('/books/title/foo/1', '/books/title/foo');
});

await test('/books/title/foo/0 canonicalizes to /books/title/foo', async () => {
	await expectRedirect('/books/title/foo/0', '/books/title/foo');
});

await test('/books/title/foo/abc canonicalizes to /books/title/foo', async () => {
	await expectRedirect('/books/title/foo/abc', '/books/title/foo');
});

await test('/books/title/foo/2 renders a paged search', async () => {
	const r = await get('/books/title/foo/2', 200, 'GET /books/title/foo/2');
	assert(r.text.includes('藏书'), 'paged search should render 藏书');
});
/* ------------------- 藏书 detail (/books/[bookid].html) ------------------- */

await test('malformed bookid (non-5-digit) returns 404', async () => {
	await get('/books/abc.html', 404, 'GET /books/abc.html');
});

await test('unknown 5-digit bookid returns the 404 page', async () => {
	const r = await get('/books/99999.html', 404, 'GET /books/99999.html');
	assert(r.text.includes('架上无此书'), '404 page should render for a missing book');
});

await test('a real book detail page renders (bookid discovered from /books)', async () => {
	const listing = await req('/books');
	assertStatus(listing.res, 200, 'GET /books (to discover a bookid)');
	const match = listing.text.match(/\/books\/(\d{5})\.html/);
	assert(match, 'expected at least one book link on /books');
	const bookid = match[1];

	const detail = await req(`/books/${bookid}.html`);
	assertStatus(detail.res, 200, `GET /books/${bookid}.html`);
	assert(detail.text.includes('访问统计'), 'detail page should render the 访问统计 section');
	assert(detail.text.includes('任氏有无轩'), 'detail page should render the site shell');
});

/* ---------------------------- 读书 (/reviews) ------------------------------ */

await test('/reviews renders the 读书 heading', async () => {
	const r = await get('/reviews', 200, 'GET /reviews');
	assert(r.text.includes('读书'), '/reviews should render 读书');
});

await test('/reviews/1 renders the same 读书 listing', async () => {
	const r = await get('/reviews/1', 200, 'GET /reviews/1');
	assert(r.text.includes('读书'), '/reviews/1 should render 读书');
});

await test('/reviews/2 renders a (possibly empty) paged listing', async () => {
	const r = await get('/reviews/2', 200, 'GET /reviews/2');
	assert(r.text.includes('读书'), '/reviews/2 should render 读书');
});

/* ------------------------ 回闪 (/on-this-day) ----------------------------- */

await test('/on-this-day renders the 此日 heading', async () => {
	const r = await get('/on-this-day', 200, 'GET /on-this-day');
	assert(r.text.includes('此日'), '/on-this-day should render 此日');
});

/* --------------------------- 统计 (/stats) -------------------------------- */

await test('/stats renders the 统计 heading', async () => {
	const r = await get('/stats', 200, 'GET /stats');
	assert(r.text.includes('统计'), '/stats should render 统计');
});
/* ------------------- 首页 proxies (/api/dashboard/…) ----------------------- */

await test('/api/dashboard/random returns JSON', async () => {
	const r = await req('/api/dashboard/random');
	assertStatus(r.res, 200, 'GET /api/dashboard/random');
	assert(r.json() !== null, 'dashboard/random should return JSON');
});

await test('/api/dashboard/wotd returns JSON', async () => {
	const r = await req('/api/dashboard/wotd');
	assertStatus(r.res, 200, 'GET /api/dashboard/wotd');
	assert(r.json() !== null, 'dashboard/wotd should return JSON');
});

await test('/api/dashboard/qotd returns JSON', async () => {
	const r = await req('/api/dashboard/qotd');
	assertStatus(r.res, 200, 'GET /api/dashboard/qotd');
	assert(r.json() !== null, 'dashboard/qotd should return JSON');
});

/* ------------------- 访问趋势 proxy (/api/stats/visits/…) ------------------ */

await test('/api/stats/visits serves supported ranges', async () => {
	await get('/api/stats/visits/7', 200, 'GET /api/stats/visits/7');
	await get('/api/stats/visits/30', 200, 'GET /api/stats/visits/30');
	await get('/api/stats/visits/365', 200, 'GET /api/stats/visits/365');
});

await test('/api/stats/visits rejects an out-of-range days value', async () => {
	await get('/api/stats/visits/15', 400, 'GET /api/stats/visits/15');
});

/* ------------- 添加标签 proxy (/api/books/[bookid]/tags) ------------------- */

await test('POST /api/books/invalid/tags returns 400', async () => {
	const r = await req('/api/books/invalid/tags', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ tags: ['标签'] })
	});
	assertStatus(r.res, 400, 'POST /api/books/invalid/tags');
});

await test('POST /api/books/00001/tags with no body returns 400', async () => {
	const r = await req('/api/books/00001/tags', { method: 'POST' });
	assertStatus(r.res, 400, 'POST /api/books/00001/tags');
	assert(r.text.includes('至少需要一个标签'), 'empty tag request should be rejected');
});

await test('GET /api/books/00001/tags is not allowed (405)', async () => {
	await get('/api/books/00001/tags', 405, 'GET /api/books/00001/tags');
});

await test('POST /api/dashboard/qotd is not allowed (405)', async () => {
	const r = await req('/api/dashboard/qotd', { method: 'POST' });
	assertStatus(r.res, 405, 'POST /api/dashboard/qotd');
});

/* -------------------------------- Summary -------------------------------- */

const passCount = results.filter((r) => r.pass).length;
const failCount = results.length - passCount;

console.log('');
console.log(`\x1b[1m${results.length} tests, ${passCount} passed, ${failCount} failed\x1b[0m`);
if (failCount > 0) {
	console.log('\nFailed:');
	for (const r of results) {
		if (!r.pass) console.log(`  \x1b[31m✗\x1b[0m ${r.name}\n     ${r.err?.message}`);
	}
}

process.exit(failCount > 0 ? 1 : 0);
