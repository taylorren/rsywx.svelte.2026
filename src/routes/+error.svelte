<script lang="ts">
	import { page } from '$app/state';
	import { dev } from '$app/environment';

	const is404 = $derived(page.status === 404);
	const code = $derived(page.status);

	const heading = $derived(is404 ? '架上无此书' : '服务器开小差了');
	const message = $derived(
		is404
			? page.error?.message && page.error.message !== 'Not Found'
				? `${page.error.message}——它可能被移走了，或者从未上架。`
				: '这个页面不在架上。它可能被移走了，或者从未存在。'
			: '出了点问题，请稍后再试；若持续出现，请联系站主。'
	);
	// Unexpected errors only reveal their stack/细节 in dev.
	const detail = $derived(!is404 && dev ? (page.error?.message ?? '') : '');
</script>

<svelte:head>
	<title>{code} – 任氏有无轩</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<section
	class="mx-auto flex max-w-2xl flex-col items-center px-5 py-16 text-center sm:py-24"
	aria-labelledby="error-heading"
>
	<!-- A slot left empty on the shelf: what you were looking for is not here. -->
	<svg
		viewBox="0 0 240 160"
		fill="none"
		class="h-36 w-auto text-ink-400 sm:h-44"
		role="img"
		aria-label="书架上有一个空位"
	>
		<path d="M20 130 H220" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
		<path d="M20 130 V150" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
		<path d="M220 130 V150" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
		<rect x="40" y="60" width="18" height="70" rx="2" fill="currentColor" opacity="0.85" />
		<rect x="62" y="74" width="16" height="56" rx="2" fill="currentColor" opacity="0.5" />
		<rect x="82" y="50" width="20" height="80" rx="2" fill="currentColor" opacity="0.7" />
		<rect
			x="106"
			y="56"
			width="20"
			height="74"
			rx="2"
			stroke="currentColor"
			stroke-width="2"
			stroke-dasharray="5 4"
		/>
		<rect
			x="132"
			y="68"
			width="16"
			height="62"
			rx="2"
			fill="currentColor"
			opacity="0.6"
			transform="rotate(8 140 99)"
		/>
		<rect x="156" y="56" width="18" height="74" rx="2" fill="currentColor" opacity="0.8" />
		<rect x="178" y="78" width="14" height="52" rx="2" fill="currentColor" opacity="0.45" />
		<rect x="198" y="106" width="26" height="12" rx="2" fill="currentColor" opacity="0.55" />
		<rect x="198" y="118" width="26" height="12" rx="2" fill="currentColor" opacity="0.75" />
	</svg>

	<p class="mt-8 font-display text-[10rem] font-semibold leading-none tracking-tight text-ink-900">{code}</p>
	<h1 id="error-heading" class="mt-4 font-display text-2xl font-medium text-ink-700">{heading}</h1>
	<p class="mt-3 max-w-md text-sm leading-7 text-ink-500">{message}</p>

	<div class="mt-24 flex flex-wrap items-center justify-center gap-3">
		<a
			href="/"
			class="rounded-lg bg-leaf-600 px-5 py-2.5 text-sm font-medium text-paper-50 transition hover:bg-leaf-700"
		>
			返回首页
		</a>
		{#if is404}
			<a
				href="/books"
				class="rounded-lg border border-paper-300 px-5 py-2.5 text-sm font-medium text-ink-700 transition hover:border-leaf-600 hover:text-leaf-600"
			>
				浏览藏书
			</a>
			<a
				href="/reviews"
				class="rounded-lg border border-paper-300 px-5 py-2.5 text-sm font-medium text-ink-700 transition hover:border-leaf-600 hover:text-leaf-600"
			>
				读书笔记
			</a>
		{/if}
	</div>

	{#if detail}
		<pre
			class="mt-10 max-w-full overflow-auto rounded-lg bg-paper-100 p-4 text-left text-xs leading-5 text-ink-500">{detail}</pre>
	{/if}
</section>
