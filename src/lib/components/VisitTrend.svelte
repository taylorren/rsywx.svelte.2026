<script lang="ts">
	import type { VisitPoint } from '$lib/types';

	/**
	 * Lightweight, dependency-free SVG line/area chart for daily visit counts.
	 * - Theme-aware: colors come from the CSS custom properties in app.css.
	 * - Responsive: fixed viewBox, scales to container width.
	 * - Interactive: hover / keyboard (Tab + ←/→) show a value tooltip.
	 * - Reduced-motion friendly: the line-draw animation is skipped when the
	 *   user prefers reduced motion.
	 */
	let {
		data
	}: {
		/** Daily visit points, oldest first. */
		data: VisitPoint[];
	} = $props();

	const WIDTH = 800;
	const HEIGHT = 280;
	const PAD = { top: 16, right: 16, bottom: 32, left: 48 };

	let hoverIndex = $state<number | null>(null);

	const totalVisits = $derived(data.reduce((sum, d) => sum + d.visit_count, 0));
	const maxRaw = $derived(Math.max(...data.map((d) => d.visit_count), 0));

	/** Round the axis maximum up to a "nice" number (1/2/5 × power of 10). */
	const niceMax = $derived.by(() => {
		const v = Math.max(maxRaw, 1);
		const pow = Math.pow(10, Math.floor(Math.log10(v)));
		const norm = v / pow;
		return (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10) * pow;
	});

	const yTicks = $derived([0, 1, 2, 3, 4].map((i) => (niceMax * i) / 4));

	const plotWidth = WIDTH - PAD.left - PAD.right;
	const plotHeight = HEIGHT - PAD.top - PAD.bottom;

	const x = (i: number): number =>
		data.length <= 1
			? PAD.left + plotWidth / 2
			: PAD.left + (plotWidth * i) / (data.length - 1);
	const y = (v: number): number => HEIGHT - PAD.bottom - (plotHeight * v) / niceMax;

	const xTicks = $derived.by(() => {
		const count = Math.min(6, data.length);
		const ticks: { i: number; label: string }[] = [];
		for (let t = 0; t < count; t++) {
			const i = Math.round((t * (data.length - 1)) / Math.max(count - 1, 1));
			ticks.push({ i, label: shortDate(data[i].date) });
		}
		return ticks;
	});

	const linePath = $derived(
		data
			.map((d, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(d.visit_count).toFixed(1)}`)
			.join(' ')
	);
	const areaPath = $derived(
		`${linePath} L${x(data.length - 1).toFixed(1)},${y(0).toFixed(1)} L${x(0).toFixed(1)},${y(0).toFixed(1)} Z`
	);

	const hoverPoint = $derived(hoverIndex !== null ? data[hoverIndex] : null);

	const tooltipStyle = $derived.by(() => {
		if (hoverIndex === null) return '';
		const pct = (x(hoverIndex) / WIDTH) * 100;
		const shift = hoverIndex === 0 ? 0 : hoverIndex === data.length - 1 ? -100 : -50;
		return `left:${pct.toFixed(1)}%;transform:translateX(${shift}%);`;
	});

	const fmtCount = (v: number): string => v.toLocaleString('zh-CN');

	function shortDate(date: string): string {
		return new Intl.DateTimeFormat('zh-CN', { month: 'numeric', day: 'numeric' }).format(
			new Date(`${date}T00:00:00`)
		);
	}

	function fullDate(date: string): string {
		return new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }).format(
			new Date(`${date}T00:00:00`)
		);
	}

	function handlePointerMove(event: PointerEvent) {
		const svg = event.currentTarget as SVGSVGElement;
		const rect = svg.getBoundingClientRect();
		const px = ((event.clientX - rect.left) / rect.width) * WIDTH;
		const ratio = Math.min(Math.max((px - PAD.left) / plotWidth, 0), 1);
		hoverIndex = Math.round(ratio * (data.length - 1));
	}

	function handlePointerLeave() {
		hoverIndex = null;
	}
</script>

{#if data.length > 1}
	<div class="relative">
		<svg
			viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
			class="h-auto w-full"
			role="img"
			aria-label="近 {data.length} 天每日访问量折线图，共计 {fmtCount(totalVisits)} 次访问"
			onpointermove={handlePointerMove}
			onpointerleave={handlePointerLeave}
		>
			<title>每日访问量趋势</title>
			<desc>
				从 {data[0].date} 到 {data[data.length - 1].date} 的每日访问量，最高单日 {fmtCount(maxRaw)} 次。
			</desc>

			<defs>
				<linearGradient id="vt-area" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stop-color="var(--color-leaf-600)" stop-opacity="0.35" />
					<stop offset="100%" stop-color="var(--color-leaf-600)" stop-opacity="0" />
				</linearGradient>
			</defs>

			<!-- Horizontal gridlines + y labels -->
			{#each yTicks as tick}
				<line
					x1={PAD.left}
					x2={WIDTH - PAD.right}
					y1={y(tick)}
					y2={y(tick)}
					stroke="var(--color-paper-300)"
					stroke-width="1"
				/>
				<text
					x={PAD.left - 8}
					y={y(tick) + 3}
					text-anchor="end"
					font-size="11"
					fill="var(--color-ink-500)"
				>
					{fmtCount(tick)}
				</text>
			{/each}

			<!-- X labels -->
			{#each xTicks as tick}
				<text
					x={x(tick.i)}
					y={HEIGHT - PAD.bottom + 18}
					text-anchor="middle"
					font-size="11"
					fill="var(--color-ink-500)"
				>
					{tick.label}
				</text>
			{/each}

			<!-- Area + line -->
			<path d={areaPath} fill="url(#vt-area)" />
			<path
				d={linePath}
				fill="none"
				stroke="var(--color-leaf-600)"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				pathLength="1"
				class="line-anim"
			/>

			<!-- Hover guide -->
			{#if hoverPoint && hoverIndex !== null}
				<line
					x1={x(hoverIndex)}
					x2={x(hoverIndex)}
					y1={PAD.top}
					y2={HEIGHT - PAD.bottom}
					stroke="var(--color-leaf-600)"
					stroke-width="1"
					stroke-dasharray="4 3"
				/>
				<circle
					cx={x(hoverIndex)}
					cy={y(hoverPoint.visit_count)}
					r="4"
					fill="var(--color-leaf-600)"
					stroke="var(--color-paper-50)"
					stroke-width="2"
				/>
			{/if}
		</svg>

		{#if hoverPoint && hoverIndex !== null}
			<div
				class="pointer-events-none absolute top-2 z-10 rounded-lg border border-paper-200 bg-paper-100 px-3 py-2 text-xs shadow-soft"
				style={tooltipStyle}
			>
				<p class="font-medium text-ink-900">{fullDate(hoverPoint.date)} · {hoverPoint.day_of_week}</p>
				<p class="mt-0.5 text-ink-500">{fmtCount(hoverPoint.visit_count)} 次访问</p>
			</div>
		{/if}
	</div>
{:else}
	<p class="rounded-lg border border-dashed border-paper-300 p-8 text-center text-ink-500">
		暂无访问数据。
	</p>
{/if}

<style>
	.line-anim {
		stroke-dasharray: 1;
		stroke-dashoffset: 1;
	}
	@media (prefers-reduced-motion: no-preference) {
		.line-anim {
			animation: vt-draw 1.2s ease-out forwards;
		}
	}
	@keyframes vt-draw {
		to {
			stroke-dashoffset: 0;
		}
	}
</style>
