<script lang="ts">
	import type { BookListItem, Qotd, Wotd } from '$lib/types';
	import BookTile from './BookTile.svelte';

	let {
		wotd,
		qotd,
		today
	}: { wotd?: Wotd; qotd?: Qotd; today: { items: BookListItem[]; yearsAgo: string } } =
		$props();

	const todayLabel = (() => {
		const d = new Date();
		return `${d.getMonth() + 1} 月 ${d.getDate()} 日`;
	})();
</script>

<div class="flex flex-col gap-5">
	{#if wotd}
		<div class="rounded-xl border border-paper-200 bg-paper-100 p-5">
			<h3 class="text-sm font-medium uppercase tracking-wide text-ink-500">Word of the Day</h3>
			<p class="mt-2 font-display text-2xl font-semibold text-leaf-700">{wotd.word}</p>
			{#if wotd.type}<p class="text-sm italic text-ink-500">{wotd.type}</p>{/if}
			<p class="mt-2 text-sm leading-relaxed text-ink-700">{wotd.meaning}</p>
		</div>
	{/if}

	{#if qotd}
		<div class="rounded-xl border border-paper-200 bg-paper-100 p-5">
			<h3 class="text-sm font-medium uppercase tracking-wide text-ink-500">Quote of the Day</h3>
			<blockquote class="mt-2 font-display text-lg italic leading-relaxed text-ink-900">
				“{qotd.quote}”
			</blockquote>
			{#if qotd.source}
				<p class="mt-2 text-right text-sm text-ink-500">— {qotd.source}</p>
			{/if}
		</div>
	{/if}

	<div class="rounded-xl border border-paper-200 bg-paper-100 p-5">
		<h3 class="font-display text-lg font-semibold text-ink-900">今天 {todayLabel}</h3>
		{#if today.items.length}
			<p class="mb-3 text-sm text-ink-500">购买于今日{today.yearsAgo}的书</p>
			<div class="grid grid-cols-2 gap-3">
				{#each today.items as book}
					<BookTile {book} />
				{/each}
			</div>
		{:else}
			<p class="mt-2 text-sm text-ink-500">今天没有值得纪念的藏书。</p>
		{/if}
	</div>
</div>