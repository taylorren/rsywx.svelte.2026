<script lang="ts">
	import type { BooksStatus } from '$lib/types';

	let { status, onRetry }: { status?: BooksStatus; onRetry?: () => void } = $props();

	const fmt = (n?: number) => (typeof n === 'number' ? n.toLocaleString('zh-CN') : '—');

	const items = $derived([
		{ label: '藏书', value: fmt(status?.total_books), icon: '📚' },
		{ label: '总页数', value: fmt(status?.total_pages), icon: '📄' },
		{ label: '总字数（千）', value: fmt(status?.total_kwords), icon: '✒️' },
		{ label: '访问量', value: fmt(status?.total_visits), icon: '👁' }
	]);
</script>

{#if status}
	<section class="grid grid-cols-2 gap-4 sm:grid-cols-4">
		{#each items as item}
			<div
				class="rounded-xl border border-paper-200 bg-paper-100 p-5 text-center shadow-soft"
			>
				<p class="text-2xl text-paper-300" aria-hidden="true">{item.icon}</p>
				<p class="mt-2 font-display text-3xl font-semibold text-ink-900 tabular-nums">
					{item.value}
				</p>
				<p class="mt-1 text-sm text-ink-500">{item.label}</p>
			</div>
		{/each}
	</section>
{:else}
	<section class="grid grid-cols-2 gap-4 sm:grid-cols-4" aria-busy="true">
		{#each [0, 1, 2, 3] as _}
			<div class="rounded-xl border border-paper-200 bg-paper-100 p-5 text-center shadow-soft">
				<div class="mx-auto h-4 w-4 animate-pulse rounded-full bg-paper-300"></div>
				<div class="mx-auto mt-3 h-8 w-20 animate-pulse rounded bg-paper-300"></div>
				<div class="mx-auto mt-2 h-3 w-12 animate-pulse rounded bg-paper-300"></div>
			</div>
		{/each}
	</section>
	{#if onRetry}
		<p class="mt-3 text-center text-sm text-red-600 dark:text-red-400">统计信息加载失败。</p>
		<div class="mt-2 text-center">
			<button
				type="button"
				onclick={onRetry}
				class="rounded-md border border-paper-300 px-3 py-1.5 text-sm font-medium text-ink-700 transition hover:border-leaf-600 hover:text-leaf-600"
			>
				重试
			</button>
		</div>
	{/if}
{/if}