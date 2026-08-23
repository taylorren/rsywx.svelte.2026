<script lang="ts">
	import VisitTrend from './VisitTrend.svelte';
	import RankedBookList from './RankedBookList.svelte';
	import { RANGE_OPTIONS, DEFAULT_RANGE_DAYS } from '$lib/visits';
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

	const formatDate = (d: string | null | undefined): string =>
		d ? d.slice(0, 10) : '';

	/* --------------------- 访问趋势 range switcher + stats -------------------- */

	let trendDays = $state(DEFAULT_RANGE_DAYS);
	/** Last successfully fetched non-default range (default range uses the server prop). */
	let trendHistory = $state<VisitHistory | undefined>(undefined);
	let loadingTrend = $state(false);
	let trendError = $state(false);
	let fetchSeq = 0;

	/**
	 * Chart source: the server-loaded default snapshot while the user is on the
	 * default range; otherwise the last fetched range — falling back to the
	 * default snapshot so a failed fetch never blanks the chart.
	 */
	const chartHistory = $derived(
		trendDays === DEFAULT_RANGE_DAYS ? history : (trendHistory ?? history)
	);

	async function changeRange() {
		const seq = ++fetchSeq;
		loadingTrend = true;
		trendError = false;
		try {
			const res = await fetch(`/api/stats/visits/${trendDays}`);
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const body = (await res.json()) as VisitHistory;
			if (seq === fetchSeq) {
				trendHistory = body;
				trendError = false;
			}
		} catch {
			// Snap back to the default range — its data is still on screen.
			if (seq === fetchSeq) {
				trendError = true;
				trendDays = DEFAULT_RANGE_DAYS;
			}
		} finally {
			if (seq === fetchSeq) loadingTrend = false;
		}
	}

	const periodCaption = $derived.by(() => {
		if (!chartHistory?.period_info) return null;
		const { start_date, end_date, total_days, total_visits } = chartHistory.period_info;
		return `${start_date} → ${end_date} · 共 ${total_visits.toLocaleString('zh-CN')} 次访问`;
	});

	const trendTotal = $derived(chartHistory?.period_info.total_visits ?? 0);
	const trendDaysCount = $derived(chartHistory?.period_info.total_days ?? 0);
	const trendMaxDaily = $derived(
		Math.max(...(chartHistory?.data.map((d) => d.visit_count) ?? [0]))
	);
	const trendDailyAvg = $derived(
		trendDaysCount > 0 ? Math.round(trendTotal / trendDaysCount) : 0
	);
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
			class="flex flex-col gap-4"
		>
			<div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
				{#if periodCaption}
					<p class="text-sm text-ink-500">{periodCaption}</p>
				{/if}
				<label class="flex items-center gap-2 text-sm text-ink-500">
					<span>时间范围</span>
					<select
						value={trendDays}
						class="w-40 rounded-lg border border-paper-300 bg-paper-100 px-3 py-2 text-sm text-ink-900 focus:border-leaf-600 focus:outline-none dark:border-paper-300 dark:bg-paper-100 dark:text-ink-900 dark:focus:border-leaf-600"
						onchange={(e) => {
							trendDays = Number(e.currentTarget.value);
							changeRange();
						}}
					>
						{#each RANGE_OPTIONS as opt (opt.days)}
							<option value={opt.days}>{opt.label}</option>
						{/each}
					</select>
				</label>
			</div>

			<div
				class="relative transition-opacity {loadingTrend ? 'opacity-60' : ''}"
				aria-busy={loadingTrend}
			>
				{#if chartHistory?.data.length}
					<VisitTrend data={chartHistory.data} />
				{:else if loadingTrend}
					<div class="flex h-64 items-center justify-center text-sm text-ink-500">
						加载中…
					</div>
				{/if}
			</div>

			{#if trendError}
				<p class="text-sm text-red-600">加载失败，请重试。</p>
			{/if}

			{#if chartHistory}
				<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
					<div class="rounded-lg border border-paper-200 bg-paper-50 px-4 py-3 text-center">
						<p class="font-display text-xl font-semibold text-ink-900 tabular-nums">
							{trendTotal.toLocaleString('zh-CN')}
						</p>
						<p class="mt-0.5 text-xs text-ink-500">总访问量</p>
					</div>
					<div class="rounded-lg border border-paper-200 bg-paper-50 px-4 py-3 text-center">
						<p class="font-display text-xl font-semibold text-ink-900 tabular-nums">
							{trendDailyAvg.toLocaleString('zh-CN')}
						</p>
						<p class="mt-0.5 text-xs text-ink-500">日均访问</p>
					</div>
					<div class="rounded-lg border border-paper-200 bg-paper-50 px-4 py-3 text-center">
						<p class="font-display text-xl font-semibold text-ink-900 tabular-nums">
							{trendMaxDaily.toLocaleString('zh-CN')}
						</p>
						<p class="mt-0.5 text-xs text-ink-500">最高单日</p>
					</div>
					<div class="rounded-lg border border-paper-200 bg-paper-50 px-4 py-3 text-center">
						<p class="font-display text-xl font-semibold text-ink-900 tabular-nums">
							{trendDaysCount.toLocaleString('zh-CN')}
						</p>
						<p class="mt-0.5 text-xs text-ink-500">统计天数</p>
					</div>
				</div>
			{/if}
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
