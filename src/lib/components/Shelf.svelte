<script lang="ts">
	import type { BookListItem } from '$lib/types';
	import BookTile from './BookTile.svelte';

	let {
		title,
		books,
		viewAll
	}: { title: string; books: BookListItem[]; viewAll?: string } = $props();
</script>

<section>
	<div class="mb-3 flex items-end justify-between">
		<h2 class="font-display text-xl font-semibold text-ink-900">{title}</h2>
		{#if viewAll}
			<a href={viewAll} class="text-sm text-ink-500 transition hover:text-leaf-600">
				查看全部 →
			</a>
		{/if}
	</div>

	{#if books.length}
		<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
			{#each books as book}
				<BookTile {book} />
			{/each}
		</div>
	{:else}
		<p class="rounded-lg border border-dashed border-paper-300 p-6 text-center text-sm text-ink-500">
			暂无数据
		</p>
	{/if}
</section>