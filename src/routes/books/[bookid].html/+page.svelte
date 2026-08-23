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
	<div class="grid gap-8 md:grid-cols-[minmax(0,400px)_1fr]">
		<div class="mx-auto w-full max-w-[400px]">
			{#if !coverUnavailable}
				<img
					src={`/covers/${book.bookid}.jpg`}
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
