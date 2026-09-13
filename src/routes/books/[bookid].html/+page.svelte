<script lang="ts">
	let { data } = $props();

	const book = $derived(data.book);
	let coverUnavailable = $state(false);

	// Tags added in this session — merged over the (possibly cached) server list.
	let extraTags = $state<string[]>([]);
	const displayTags = $derived([...new Set([...book.tags, ...extraTags])]);

	let addingTag = $state(false);
	let tagInput = $state('');
	let tagSaving = $state(false);
	let tagError = $state('');
	let tagSuccess = $state(false);

	async function submitTag(event: SubmitEvent) {
		event.preventDefault();
		// Space-separated input → multiple tags; mirror server limits (≤10, each ≤20 chars).
		const tags = [
			...new Set(
				tagInput
					.trim()
					.split(/\s+/)
					.map((t) => t.slice(0, 20))
					.filter((t) => t.length > 0)
			)
		].slice(0, 10);
		if (tags.length === 0 || tagSaving) return;
		tagSaving = true;
		tagError = '';
		tagSuccess = false;
		try {
			const res = await fetch(`/api/books/${book.bookid}/tags`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ tags })
			});
			const body = (await res.json().catch(() => null)) as
				| { success?: boolean; message?: string; tags?: string[] }
				| null;
			if (!res.ok || !body || body.success === false) {
				throw new Error(body?.message ?? '添加标签失败。');
			}
			extraTags = Array.isArray(body.tags) ? body.tags : [...extraTags, ...tags];
			tagInput = '';
			addingTag = false;
			tagSuccess = true;
		} catch (e) {
			tagError = e instanceof Error ? e.message : '添加标签失败。';
		} finally {
			tagSaving = false;
		}
	}

	function handleCoverError() {
		coverUnavailable = true;
	}

	const publicFacts = $derived(
		[
			['出版社', book.publisher_name],
			['出版日期', book.pubdate],
			['印刷日期', book.printdate],
			['装帧', book.deco],
			['版次', book.ver],
			['页数', book.page ? `${book.page} 页` : null],
			['千字数', book.kword != null ? `${book.kword} 千字` : null]
		].filter(([, value]) => value) as [string, string][]
	);

	const catalogFacts = $derived(
		[
			['ISBN', book.isbn],
			['分类号', book.category],
			['收藏位置', book.location]
		].filter(([, value]) => value) as [string, string][]
	);

	const collectionFacts = $derived(
		[
			['购买日期', book.purchdate],
			['购买价格', book.price ? `¥${book.price}` : null],
			['购买地点', book.place_name],
			['库存状态', book.instock ? '在库' : '外借']
		].filter(([, value]) => value) as [string, string][]
	);
</script>

<svelte:head>
	<title>{data.metadata.title}</title>
	<meta name="description" content={data.metadata.description} />
</svelte:head>

<article class="mx-auto max-w-6xl">
	<!-- Breadcrumb -->
	<nav aria-label="面包屑" class="text-sm text-ink-500">
		<ol class="flex flex-wrap items-center gap-x-1.5 gap-y-1">
			<li>
				<a href="/" class="transition hover:text-leaf-700 hover:underline">首页</a>
			</li>
			<li aria-hidden="true">›</li>
			<li>
				<a href="/books" class="transition hover:text-leaf-700 hover:underline">藏书</a>
			</li>
			<li aria-hidden="true">›</li>
			<li class="font-medium text-ink-900" aria-current="page">{book.title}</li>
		</ol>
	</nav>

	<!-- 基本信息 hero -->
	<div class="mt-6 grid gap-8 md:grid-cols-[minmax(0,600px)_1fr]">
		<div class="min-w-0">
			{#if !coverUnavailable}
				<div class="relative">
					<div class="w-[600px] max-w-full overflow-hidden rounded-md border border-paper-200 shadow-soft">
						<img
							src={`/covers/${book.bookid}.jpg`}
							alt={book.title}
							width={600}
							decoding="async"
							fetchpriority="high"
							onerror={handleCoverError}
							class="h-auto w-[600px] max-w-full"
						/>
					</div>
					<span
						class="pointer-events-none absolute right-0 top-[42%] select-none whitespace-nowrap bg-gradient-to-r from-red-700 via-red-600 to-red-800 px-8 py-2.5 pl-5 font-display text-sm font-bold tracking-[0.15em] text-yellow-100 shadow-lg ring-1 ring-red-900/60" style="text-shadow: 0 1px 1px rgba(0,0,0,0.5), 0 -1px 0 rgba(255,200,150,0.3)"
						aria-hidden="true"
					>
						任氏有无轩
					</span>
				</div>
			{:else}
				<div class="flex aspect-[3/4] items-center justify-center rounded-md bg-paper-200 p-6 text-center">
					<span class="font-display text-2xl text-ink-500">{book.title}</span>
				</div>
			{/if}
		</div>

		<div>
			<p class="text-xs font-medium tracking-wide text-ink-400 uppercase">藏书编号 {book.bookid}</p>
			<h1 class="mt-2 font-display text-4xl font-semibold leading-tight text-ink-900">{book.title}</h1>
			<p class="mt-3 text-lg text-ink-700">
				{book.region ? `【${book.region}】` : ''}{book.author || '佚名'}{book.translated && book.copyrighter ? ` · 译者：${book.copyrighter}` : ''}
			</p>

			<div class="mt-5">
				{#if displayTags.length}
					<div class="flex flex-wrap items-center gap-2">
						{#each displayTags as tag}
							<a
								href={`/books/tag/${encodeURIComponent(tag)}`}
								class="rounded-full bg-leaf-100 px-3 py-1 text-sm text-leaf-700 transition hover:bg-leaf-600 hover:text-paper-50"
							>
								{tag}
							</a>
						{/each}
						<button
							type="button"
							onclick={() => (addingTag = !addingTag)}
							aria-expanded={addingTag}
							aria-controls="add-tag-form"
							class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-dashed border-paper-300 text-lg leading-none text-ink-500 transition hover:border-leaf-600 hover:text-leaf-600"
							aria-label="添加标签"
						>
							+
						</button>
					</div>
				{:else}
					<button
						type="button"
						onclick={() => (addingTag = !addingTag)}
						aria-expanded={addingTag}
						aria-controls="add-tag-form"
						class="rounded-full border border-dashed border-paper-300 px-3 py-1 text-sm text-ink-500 transition hover:border-leaf-600 hover:text-leaf-600"
					>
						+ 添加标签
					</button>
				{/if}

				{#if addingTag}
					<form id="add-tag-form" class="mt-3 flex flex-wrap items-center gap-2" onsubmit={submitTag}>
						<label class="sr-only" for="new-tag">新标签</label>
						<input
							id="new-tag"
							bind:value={tagInput}
						placeholder="输入新标签"
							class="w-48 rounded-lg border border-paper-300 bg-paper-100 px-3 py-1.5 text-sm text-ink-900 placeholder:text-ink-500 focus:border-leaf-600 dark:border-paper-300 dark:bg-paper-100 dark:text-ink-100 dark:placeholder:text-ink-500"
						/>
						<button
							type="submit"
							disabled={tagSaving || !tagInput.trim()}
							class="rounded-lg bg-leaf-600 px-3 py-1.5 text-sm font-medium text-paper-50 transition hover:bg-leaf-700 disabled:cursor-not-allowed disabled:opacity-50"
						>
							{tagSaving ? '添加中…' : '添加'}
						</button>
						<button
							type="button"
							onclick={() => (addingTag = false)}
							class="rounded-lg px-3 py-1.5 text-sm text-ink-500 transition hover:text-ink-700"
						>
							取消
						</button>
					</form>
					<p class="mt-2 text-xs text-ink-500">
						可一次添加多个标签，<span class="font-medium text-leaf-700">用空格分割</span>，每个不超过 20 字。
					</p>
				{/if}

				{#if tagError}
					<p class="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">{tagError}</p>
				{/if}
				{#if tagSuccess}
					<p class="mt-2 text-sm text-leaf-700">标签已添加。</p>
				{/if}
			</div>

			{#if book.intro}
				<div class="mt-8">
					<h2 class="font-display text-2xl font-semibold text-ink-900">内容简介</h2>
					<p class="mt-3 whitespace-pre-line leading-8 text-ink-700">{book.intro}</p>
				</div>
			{/if}
		</div>
	</div>

	<!-- 出版信息 / 编目信息 / 收藏信息 / 访问统计 -->
	<div class="mt-8 grid gap-6 sm:grid-cols-2">
		{#if publicFacts.length}
			<section class="rounded-xl border border-paper-200 bg-paper-100/60 p-5">
				<h2 class="font-display text-lg font-semibold text-ink-900">出版信息</h2>
				<dl class="mt-4 space-y-3">
					{#each publicFacts as [label, value]}
						<div class="flex justify-between gap-6 text-sm">
							<dt class="shrink-0 text-ink-500">{label}</dt>
							<dd class="text-right text-ink-900">{value}</dd>
						</div>
					{/each}
				</dl>
			</section>
		{/if}

		{#if catalogFacts.length}
			<section class="rounded-xl border border-paper-200 bg-paper-100/60 p-5">
				<h2 class="font-display text-lg font-semibold text-ink-900">编目信息</h2>
				<dl class="mt-4 space-y-3">
					{#each catalogFacts as [label, value]}
						<div class="flex justify-between gap-6 text-sm">
							<dt class="shrink-0 text-ink-500">{label}</dt>
							<dd class="text-right text-ink-900">{value}</dd>
						</div>
					{/each}
				</dl>
			</section>
		{/if}

		{#if collectionFacts.length}
			<section class="rounded-xl border border-paper-200 bg-paper-100/60 p-5">
				<h2 class="font-display text-lg font-semibold text-ink-900">收藏信息</h2>
				<dl class="mt-4 space-y-3">
					{#each collectionFacts as [label, value]}
						<div class="flex justify-between gap-6 text-sm">
							<dt class="shrink-0 text-ink-500">{label}</dt>
							<dd class="text-right text-ink-900">{value}</dd>
						</div>
					{/each}
				</dl>
			</section>
		{/if}

		<!-- 访问统计 -->
		<section class="rounded-xl border border-paper-200 bg-paper-100/60 p-5">
			<h2 class="font-display text-lg font-semibold text-ink-900">访问统计</h2>
			<dl class="mt-4 space-y-3">
				<div class="flex justify-between gap-6 text-sm">
					<dt class="shrink-0 text-ink-500">总访问次数</dt>
					<dd class="text-right tabular-nums text-ink-900">{book.total_visits.toLocaleString('zh-CN')}</dd>
				</div>
				{#if book.last_visited}
					<div class="flex justify-between gap-6 text-sm">
						<dt class="shrink-0 text-ink-500">最近访问</dt>
						<dd class="text-right text-ink-900">{book.last_visited}</dd>
					</div>
				{/if}
			</dl>
		</section>
	</div>

	{#if book.reviews.length}
		<section class="mt-12 border-t border-paper-200 pt-8">
			<h2 class="font-display text-2xl font-semibold text-ink-900">相关书评</h2>
			<p class="mt-1 text-sm text-ink-500">关于这本书的读书笔记与感想。</p>
			<ul class="mt-6 flex flex-col divide-y divide-paper-200">
				{#each book.reviews as review (review.uri)}
					<li>
						<a
							href={review.uri}
							target="_blank"
							rel="noopener noreferrer"
							class="group flex items-start gap-4 py-5 transition hover:bg-paper-100/60 sm:gap-6 sm:px-2"
						>
							<img
								src={review.cover_uri || `/covers/${review.bookid}.jpg`}
								alt={review.book_title}
								width={600}
								height={800}
								class="h-24 w-16 shrink-0 rounded object-cover object-center shadow-soft"
								loading="lazy"
								decoding="async"
								onerror={(e) => (e.currentTarget as HTMLImageElement).style.display = 'none'}
							/>
							<div class="min-w-0">
								<p class="text-sm text-ink-500">{review.datein}</p>
								<h3 class="mt-1 font-display text-lg font-semibold text-ink-900 group-hover:text-leaf-700">
									{review.title}
								</h3>
								<p class="mt-2 text-sm font-medium text-leaf-700">阅读全文 →</p>
							</div>
						</a>
					</li>
				{/each}
			</ul>
		</section>
	{/if}
</article>
