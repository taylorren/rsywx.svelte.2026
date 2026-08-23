<script lang="ts">
	import StatsStrip from '$lib/components/StatsStrip.svelte';
	import Shelf from '$lib/components/Shelf.svelte';
	import DayWidgets from '$lib/components/DayWidgets.svelte';
	import { invalidateAll } from '$app/navigation';
	import type { DashboardData } from './+page.server';

	let { data } = $props<{ data: { dashboard: Partial<DashboardData> } }>();

	const d = $derived(data.dashboard);

	/** Re-run the server loaders — used by per-widget 重试 buttons. */
	const retry = () => invalidateAll();
</script>

<section class="flex flex-col gap-12">
	<div class="pt-2">
		<h1 class="font-display text-4xl font-semibold text-ink-900">我的书房</h1>
		<p class="mt-2 max-w-2xl text-ink-700">
			一处安静的角落，藏着多年来的书与字。
		</p>
	</div>

	<StatsStrip status={d.status} onRetry={retry} />

	<div class="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
		<div class="flex flex-col gap-10">
			<Shelf title="新入库" books={d.newest} viewAll="/books" onRetry={retry} />
			<Shelf title="手气不错" books={d.random} refreshUrl="/api/dashboard/random" onRetry={retry} />
			<Shelf title="最近访问" books={d.lastVisited} viewAll="/books" onRetry={retry} />
		</div>

		<aside class="lg:sticky lg:top-6 lg:self-start">
			<DayWidgets wotd={d.wotd} qotd={d.qotd} today={d.onThisDay} onRetry={retry} />
		</aside>
	</div>
</section>
