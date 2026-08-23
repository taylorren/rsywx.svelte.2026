<script lang="ts">
	import type { BooksStatus } from '$lib/types';

	let { status }: { status?: BooksStatus } = $props();

	const fmt = (n?: number) => (typeof n === 'number' ? n.toLocaleString('zh-CN') : '—');

	const items = $derived([
		{ label: '藏书', value: fmt(status?.total_books), icon: '📚' },
		{ label: '总页数', value: fmt(status?.total_pages), icon: '📄' },
		{ label: '总字数（千）', value: fmt(status?.total_kwords), icon: '✒️' },
		{ label: '访问量', value: fmt(status?.total_visits), icon: '👁' }
	]);
</script>

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