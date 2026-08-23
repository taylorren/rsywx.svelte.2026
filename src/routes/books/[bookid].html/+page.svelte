<script lang="ts">
	let { data } = $props();

	const book = $derived(data.book);
	let useRemoteCover = $state(false);
	let coverUnavailable = $state(false);

	function handleCoverError() {
		if (!useRemoteCover && book.cover_uri) {
			useRemoteCover = true;
			return;
		}
		coverUnavailable = true;
	}

	const facts = $derived(
		[
			['出版社', book.publisher_name],
			['出版日期', book.pubdate],
			['购入日期', book.purchdate],
			['装帧', book.deco],
			['页数', book.page ? `${book.page} 页` : null],
			['ISBN', book.isbn],
			['分类', book.category],
			['收藏位置', book.location],
			['购入地点', book.place_name],
			['价格', book.price ? `¥${book.price}` : null]
		].filter(([, value]) => value) as [string, string][]
	);
</script>

<svelte:head>
	<title>{data.metadata.title}</title>
	<meta name="description" content={data.metadata.description} />
</svelte:head>

<article class="mx-auto max-w-4xl">
	<div class="grid gap-8 md:grid-cols-[minmax(0,280px)_1fr]">
		<div class="mx-auto w-full max-w-[280px]">
			{#if !coverUnavailable}
				<img
					src={useRemoteCover ? book.cover_uri : `/covers/${book.bookid}.jpg`}
					alt={book.title}
					onerror={handleCoverError}
					class="w-full rounded-xl border border-paper-200 shadow-soft"
				/>
			{:else}
				<div class="flex aspect-[3/4] items-center justify-center rounded-xl bg-paper-200 p-6 text-center">
					<span class="font-display text-2xl text-ink-500">{book.title}</span>
				</div>
			{/if}
		</div>

		<div>
			<p class="text-sm text-ink-500">藏书编号 {book.bookid}</p>
			<h1 class="mt-2 font-display text-4xl font-semibold leading-tight text-ink-900">{book.title}</h1>
			<p class="mt-3 text-lg text-ink-700">{book.author || '佚名'}</p>
			{#if book.region}
				<p class="mt-1 text-sm text-ink-500">{book.region}{book.translated ? ' · 译著' : ''}</p>
			{/if}

			{#if book.tags.length}
				<div class="mt-5 flex flex-wrap gap-2">
					{#each book.tags as tag}
						<a
							href={`/books/tag/${encodeURIComponent(tag)}`}
							class="rounded-full bg-leaf-100 px-3 py-1 text-sm text-leaf-700 transition hover:bg-leaf-600 hover:text-paper-50"
						>
							{tag}
						</a>
					{/each}
				</div>
			{/if}

			<dl class="mt-8 grid gap-x-6 gap-y-4 border-y border-paper-200 py-6 sm:grid-cols-2">
				{#each facts as [label, value]}
					<div>
						<dt class="text-xs text-ink-500">{label}</dt>
						<dd class="mt-1 text-sm text-ink-900">{value}</dd>
					</div>
				{/each}
			</dl>

			<p class="mt-5 text-sm text-ink-500">
				已被翻阅 {book.total_visits} 次{book.last_visited ? ` · 最近一次 ${book.last_visited}` : ''}
			</p>
		</div>
	</div>

	{#if book.intro}
		<section class="mt-12 border-t border-paper-200 pt-8">
			<h2 class="font-display text-2xl font-semibold text-ink-900">内容简介</h2>
			<p class="mt-4 whitespace-pre-line leading-8 text-ink-700">{book.intro}</p>
		</section>
	{/if}
</article>
