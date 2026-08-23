<script lang="ts">
	import StatsStrip from '$lib/components/StatsStrip.svelte';
	import Shelf from '$lib/components/Shelf.svelte';
	import DayWidgets from '$lib/components/DayWidgets.svelte';
	import type { DashboardData } from './+page.server';

	let { data } = $props<{ data: { dashboard: Partial<DashboardData> } }>();

	const d = $derived(data.dashboard);
</script>

<section class="flex flex-col gap-12">
	<div class="pt-2">
		<h1 class="font-display text-4xl font-semibold text-ink-900">我的书房</h1>
		<p class="mt-2 max-w-2xl text-ink-700">
			一处安静的角落，藏着多年来的书与字。
		</p>
	</div>

	<StatsStrip status={d.status} />

	<div class="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
		<div class="flex flex-col gap-10">
			<Shelf title="新入藏" books={d.newest} viewAll="/books" />
			<Shelf title="手气不错" books={d.random} />
			<Shelf title="最近翻阅" books={d.lastVisited} viewAll="/books" />
		</div>

		<aside class="lg:sticky lg:top-6 lg:self-start">
			<DayWidgets wotd={d.wotd} qotd={d.qotd} today={d.onThisDay} />
		</aside>
	</div>
</section>
