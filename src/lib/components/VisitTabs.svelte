<script lang="ts">
	import VisitTrend from './VisitTrend.svelte';
	import RankedBookList from './RankedBookList.svelte';
	import type { BookListItem, BookPopularItem, VisitHistory } from '$lib/types';

	/**
	 * Tabbed "访问数据" panel for the stats page.
	 * Tabs: 访问趋势 (chart) / 最近访问 / 热门图书 / 冷门图书 / 被遗忘的书.
	 * Fully keyboard-accessible (WAI-ARIA tabs pattern: ←/→ to move, Home/End).
	 */
	let {
		history,
		lastVisited,
		forgotten,
		popular,
		unpopular
	}: {
		history?: VisitHistory;
		lastVisited?: BookListItem[];
		forgotten?: BookListItem[];
		popular?: BookPopularItem[];
		unpopular?: BookPopularItem[];
	} = $props();

	type TabId = 'trend' | 'visited' | 'popular' | 'unpopular' | 'forgotten';

	const tabs = $derived<{ id: TabId; label: string; enabled: boolean }[]>([
		{ id: 'trend', label: '访问趋势', enabled: (history?.data.length ?? 0) > 0 },
		{ id: 'visited', label: '最近访问', enabled: (lastVisited?.length ?? 0) > 0 },
		{ id: 'popular', label: '热门图书', enabled: (popular?.length ?? 0) > 0 },
		{ id: 'unpopular', label: '冷门图书', enabled: (unpopular?.length ?? 0) > 0 },
		{ id: 'forgotten', label: '被遗忘的书', enabled: (forgotten?.length ?? 0) > 0 }
	]);

	let active = $state<TabId>('trend');

	// Keep the active tab valid if props change (e.g. data arrives late) —
	// fall back to the first enabled tab.
	$effect(() => {
		if (!tabs.some((t) => t.id === active && t.enabled)) {
			active = tabs.find((t) => t.enabled)?.id ?? 'trend';
		}
	});

	function activate(id: TabId) {
		if (tabs.find((t) => t.id === id)?.enabled) active = id;
	}

	/** WAI-ARIA tabs keyboard navigation (roving tabindex). */
	function onKeydown(event: KeyboardEvent) {
		const enabled = tabs.filter((t) => t.enabled);
		const idx = enabled.findIndex((t) => t.id === active);
		if (idx === -1) return;
		let next: number | null = null;
		if (event.key === 'ArrowRight') next = (idx + 1) % enabled.length;
		else if (event.key === 'ArrowLeft') next = (idx - 1 + enabled.length) % enabled.length;
		else if (event.key === 'Home') next = 0;
		else if (event.key === 'End') next = enabled.length - 1;
		if (next !== null) {
			event.preventDefault();
			const target = enabled[next];
			active = target.id;
			document.getElementById(`visit-tab-${target.id}`)?.focus();
		}
	}

	const periodCaption = $derived.by(() => {
		if (!history?.period_info) return null;
		const { start_date, end_date, total_days, total_visits } = history.period_info;
		return `${start_date} → ${end_date} · 共 ${total_visits.toLocaleString('zh-CN')} 次访问`;
	});

	const formatDate = (d: string | null | undefined): string =>
		d ? d.slice(0, 10) : '';
</script>

<div class="flex flex-col gap-5">
	<div
		role="tablist"
		aria-label="访问数据"
		tabindex="-1"
		class="flex flex-wrap gap-x-6 gap-y-1 border-b border-paper-200"
		onkeydown={onKeydown}
	>
		{#each tabs as tab (tab.id)}
			<button
				role="tab"
				id={`visit-tab-${tab.id}`}
				aria-selected={active === tab.id}
				aria-controls={`visit-panel-${tab.id}`}
				tabindex={active === tab.id ? 0 : -1}
				class="-mb-px border-b-2 pb-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 {active ===
				tab.id
					? 'border-leaf-600 text-leaf-700 dark:border-leaf-600 dark:text-leaf-700'
					: 'border-transparent text-ink-500 hover:border-paper-300 hover:text-ink-900 dark:hover:border-paper-300 dark:hover:text-ink-100'}"
				onclick={() => activate(tab.id)}
				disabled={!tab.enabled}
			>
				{tab.label}
			</button>
		{/each}
	</div>

	{#if active === 'trend' && history?.data.length}
		<div
			role="tabpanel"
			id="visit-panel-trend"
			aria-labelledby="visit-tab-trend"
			class="flex flex-col gap-3"
		>
			{#if periodCaption}
				<p class="text-sm text-ink-500">{periodCaption}</p>
			{/if}
			<VisitTrend data={history.data} />
		</div>
	{:else if active === 'visited' && lastVisited?.length}
		<div
			role="tabpanel"
			id="visit-panel-visited"
			aria-labelledby="visit-tab-visited"
		>
			<RankedBookList
				items={lastVisited}
				metric={(b) => `${(b.total_visits ?? 0).toLocaleString('zh-CN')} 次访问`}
				sub={(b) => `最近 ${formatDate(b.last_visited)}`}
			/>
		</div>
	{:else if active === 'popular' && popular?.length}
		<div
			role="tabpanel"
			id="visit-panel-popular"
			aria-labelledby="visit-tab-popular"
		>
			<RankedBookList
				items={popular}
				metric={(b) => `${(b.total_visits ?? 0).toLocaleString('zh-CN')} 次访问`}
				sub={(b) => formatDate(b.last_visited)}
			/>
		</div>
	{:else if active === 'unpopular' && unpopular?.length}
		<div
			role="tabpanel"
			id="visit-panel-unpopular"
			aria-labelledby="visit-tab-unpopular"
		>
			<RankedBookList
				items={unpopular}
				metric={(b) => `${(b.total_visits ?? 0).toLocaleString('zh-CN')} 次访问`}
				sub={(b) => formatDate(b.last_visited)}
			/>
		</div>
	{:else if active === 'forgotten' && forgotten?.length}
		<div
			role="tabpanel"
			id="visit-panel-forgotten"
			aria-labelledby="visit-tab-forgotten"
		>
			<RankedBookList
				items={forgotten}
				metric={(b) => `${b.days_since_visit ?? 0} 天未读`}
				sub={(b) => `上次 ${formatDate(b.last_visited)}`}
			/>
		</div>
	{/if}
</div>
