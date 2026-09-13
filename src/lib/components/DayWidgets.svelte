<script lang="ts">
	import Button from 'flowbite-svelte/Button.svelte';
	import Card from 'flowbite-svelte/Card.svelte';
	import type { BookTodayItem, Qotd, Wotd } from '$lib/types';
	import BookTile from './BookTile.svelte';

	let {
		wotd: initialWotd,
		qotd: initialQotd,
		today,
		onRetry
	}: {
		wotd?: Wotd;
		qotd?: Qotd;
		/** undefined = failed to load. */
		today?: { items: BookTodayItem[] };
		onRetry?: () => void;
	} = $props();

	let refreshedWotd = $state<Wotd | null>(null);
	let refreshedQotd = $state<Qotd | null>(null);
	let refreshing = $state<'wotd' | 'qotd' | null>(null);
	let refreshError = $state('');

	const wotd = $derived(refreshedWotd ?? initialWotd);
	const qotd = $derived(refreshedQotd ?? initialQotd);

	const todayLabel = (() => {
		const d = new Date();
		return `${d.getMonth() + 1} 月 ${d.getDate()} 日`;
	})();

	const previewBooks = $derived(today?.items.slice(0, 4) ?? []);

	async function refresh<T extends Wotd | Qotd>(target: 'wotd' | 'qotd') {
		if (refreshing) return;

		refreshing = target;
		refreshError = '';
		try {
			const response = await fetch(`/api/dashboard/${target}`, { cache: 'no-store' });
			if (!response.ok) throw new Error('暂时无法更新内容。');
			const item = (await response.json()) as T;
			if (target === 'wotd') refreshedWotd = item as Wotd;
			else refreshedQotd = item as Qotd;
		} catch (error) {
			refreshError = error instanceof Error ? error.message : '暂时无法更新内容。';
		} finally {
			refreshing = null;
		}
	}
</script>

<div class="flex flex-col gap-5">
	{#if wotd}
		<Card class="border-paper-200 bg-paper-100 p-5 shadow-none">
			<div class="flex items-center justify-between gap-3">
				<h3 class="text-sm font-medium uppercase tracking-wide text-ink-500">Word of the Day</h3>
				<Button
					type="button"
					onclick={() => refresh('wotd')}
					disabled={refreshing !== null}
					outline
					size="xs"
					class="border-paper-300 text-ink-700 hover:border-leaf-600 hover:text-leaf-600 disabled:cursor-wait"
				>
					{refreshing === 'wotd' ? '更新中…' : '↻ 换一个'}
				</Button>
			</div>
			<p class="mt-2 font-display text-2xl font-semibold text-leaf-700">{wotd.word}</p>
			{#if wotd.type}<p class="text-sm italic text-ink-500">{wotd.type}</p>{/if}
			<p class="mt-2 text-sm leading-relaxed text-ink-700">{wotd.meaning}</p>
		</Card>
	{/if}

	{#if qotd}
		<Card class="border-paper-200 bg-paper-100 p-5 shadow-none">
			<div class="flex items-center justify-between gap-3">
				<h3 class="text-sm font-medium uppercase tracking-wide text-ink-500">Quote of the Day</h3>
				<Button
					type="button"
					onclick={() => refresh('qotd')}
					disabled={refreshing !== null}
					outline
					size="xs"
					class="border-paper-300 text-ink-700 hover:border-leaf-600 hover:text-leaf-600 disabled:cursor-wait"
				>
					{refreshing === 'qotd' ? '更新中…' : '↻ 换一句'}
				</Button>
			</div>
			<blockquote class="mt-2 font-display text-lg italic leading-relaxed text-ink-900">
				“{qotd.quote}”
			</blockquote>
			{#if qotd.source}
				<p class="mt-2 text-right text-sm text-ink-500">— {qotd.source}</p>
			{/if}
		</Card>
	{/if}
	{#if refreshError}
		<p class="text-sm text-ochre-500" role="alert">{refreshError}</p>
	{/if}

	<div class="rounded-xl border border-paper-200 bg-paper-100 p-5">
		<h3 class="font-display text-lg font-semibold text-ink-900">今天 {todayLabel}</h3>
		{#if today}
			{#if today.items.length}
				<p class="mb-3 text-sm text-ink-500">购买于这一天的书</p>
				<div class="grid grid-cols-2 gap-3">
					{#each previewBooks as book}
						<BookTile {book} sub={`${book.years_ago} 年前`} />
					{/each}
				</div>
				<a href="/on-this-day" class="mt-4 inline-block text-sm text-ink-500 transition hover:text-leaf-600">
					查看这一天的全部记忆 →
				</a>
			{:else}
				<p class="mt-2 text-sm text-ink-500">今天没有值得纪念的藏书。</p>
			{/if}
		{:else}
			<div class="mt-2" role="alert">
				<p class="text-sm text-red-600 dark:text-red-400">今天的数据加载失败。</p>
				{#if onRetry}
					<Button type="button" onclick={onRetry} color="primary" size="xs" class="mt-2">重试</Button>
				{/if}
			</div>
		{/if}
	</div>
</div>