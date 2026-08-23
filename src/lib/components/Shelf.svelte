<script lang="ts">
	import type { BookListItem } from '$lib/types';
	import BookTile from './BookTile.svelte';

	let {
		title,
		books,
		viewAll,
		refreshUrl
	}: { title: string; books: BookListItem[]; viewAll?: string; refreshUrl?: string } = $props();

	let refreshedBooks = $state<BookListItem[] | null>(null);
	let refreshing = $state(false);
	let refreshError = $state('');

	const displayedBooks = $derived(refreshedBooks ?? books);

	async function refreshBooks() {
		if (!refreshUrl || refreshing) return;

		refreshing = true;
		refreshError = '';
		try {
			const response = await fetch(refreshUrl, { cache: 'no-store' });
			if (!response.ok) throw new Error('暂时无法更新书单。');
			refreshedBooks = (await response.json()) as BookListItem[];
		} catch (error) {
			refreshError = error instanceof Error ? error.message : '暂时无法更新书单。';
		} finally {
			refreshing = false;
		}
	}
</script>

<section>
	<div class="mb-3 flex items-end justify-between">
		<h2 class="font-display text-xl font-semibold text-ink-900">{title}</h2>
		<div class="flex items-center gap-3">
			{#if refreshUrl}
				<button
					type="button"
					onclick={refreshBooks}
					disabled={refreshing}
					class="rounded-md border border-paper-300 px-2.5 py-1 text-sm font-medium text-ink-700 transition hover:border-leaf-600 hover:text-leaf-600 disabled:cursor-wait disabled:opacity-60"
				>
					{refreshing ? '更新中…' : '↻ 换一批'}
				</button>
			{/if}
			{#if viewAll}
			<a href={viewAll} class="text-sm text-ink-500 transition hover:text-leaf-600">
				查看全部 →
			</a>
			{/if}
		</div>
	</div>

	{#if displayedBooks.length}
		<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
			{#each displayedBooks as book}
				<BookTile {book} />
			{/each}
		</div>
	{:else}
		<p class="rounded-lg border border-dashed border-paper-300 p-6 text-center text-sm text-ink-500">
			暂无数据
		</p>
	{/if}
	{#if refreshError}
		<p class="mt-3 text-sm text-ochre-500" role="alert">{refreshError}</p>
	{/if}
</section>