<script lang="ts">
	import StatsStrip from '$lib/components/StatsStrip.svelte';
	import VisitTabs from '$lib/components/VisitTabs.svelte';

	let { data } = $props();

	const { status, summary, history, lastVisited, forgotten, popular, unpopular } =
		$derived(data.stats);

	const readingPeriod = $derived.by(() => {
		if (!summary?.reading_period) return null;
		const { earliest_date, latest_date, total_days } = summary.reading_period;
		return { earliest_date, latest_date, total_days };
	});

	const hasVisitData = $derived(
		!!(
			history?.data.length ||
			lastVisited?.length ||
			forgotten?.length ||
			popular?.length ||
			unpopular?.length
		)
	);
</script>

<svelte:head>
	<title>{data.metadata.title}</title>
	<meta name="description" content={data.metadata.description} />
</svelte:head>

<section class="flex flex-col gap-12">
	<div>
		<p class="text-sm font-medium tracking-wide text-leaf-700">STATISTICS</p>
		<h1 class="mt-2 font-display text-4xl font-semibold text-ink-900">统计</h1>
		<p class="mt-2 text-ink-700">这一架书的体量，和这些年翻过的页码。</p>
	</div>

	{#if status}
		<section>
			<h2 class="mb-4 font-display text-2xl font-semibold text-ink-900">藏书统计</h2>
			<StatsStrip {status} />
		</section>
	{/if}

	{#if summary}
		<section>
			<h2 class="mb-4 font-display text-2xl font-semibold text-ink-900">阅读统计</h2>
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<div class="rounded-xl border border-paper-200 bg-paper-100 p-5 text-center shadow-soft">
					<p class="text-2xl text-paper-300" aria-hidden="true">📖</p>
					<p class="mt-2 font-display text-3xl font-semibold text-ink-900 tabular-nums">
						{summary.books_read.toLocaleString('zh-CN')}
					</p>
					<p class="mt-1 text-sm text-ink-500">读完的书</p>
				</div>
				<div class="rounded-xl border border-paper-200 bg-paper-100 p-5 text-center shadow-soft">
					<p class="text-2xl text-paper-300" aria-hidden="true">✍️</p>
					<p class="mt-2 font-display text-3xl font-semibold text-ink-900 tabular-nums">
						{summary.reviews_written.toLocaleString('zh-CN')}
					</p>
					<p class="mt-1 text-sm text-ink-500">写下的书评</p>
				</div>
				{#if readingPeriod}
					<div class="flex flex-col justify-center rounded-xl border border-paper-200 bg-paper-100 p-5 text-center shadow-soft">
						<p class="text-2xl text-paper-300" aria-hidden="true">🕰️</p>
						<p class="mt-2 font-display text-3xl font-semibold text-ink-900 tabular-nums">
							{readingPeriod.total_days.toLocaleString('zh-CN')}
						</p>
						<p class="mt-1 text-sm text-ink-500">阅读跨度（天）</p>
						<p class="mt-2 text-xs text-ink-500">
							{readingPeriod.earliest_date} → {readingPeriod.latest_date}
						</p>
					</div>
				{/if}
			</div>
		</section>
	{/if}

	{#if hasVisitData}
		<section>
			<h2 class="mb-4 font-display text-2xl font-semibold text-ink-900">访问数据</h2>
			<div class="rounded-xl border border-paper-200 bg-paper-100 p-4 shadow-soft sm:p-6">
				<VisitTabs {history} {lastVisited} {forgotten} {popular} {unpopular} />
			</div>
		</section>
	{/if}
</section>
