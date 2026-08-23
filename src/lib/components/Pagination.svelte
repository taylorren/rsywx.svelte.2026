<script lang="ts">
	import Button from 'flowbite-svelte/Button.svelte';
	import Input from 'flowbite-svelte/Input.svelte';

	let {
		currentPage,
		totalPages,
		href
	}: {
		currentPage: number;
		totalPages: number;
		href: (page: number) => string;
	} = $props();

	function jumpToPage(event: SubmitEvent) {
		event.preventDefault();
		const form = event.currentTarget as HTMLFormElement;
		const page = Number(new FormData(form).get('page'));
		if (Number.isSafeInteger(page) && page >= 1 && page <= totalPages) {
			window.location.assign(href(page));
		}
	}
</script>

{#if totalPages > 1}
	<nav
		class="flex flex-nowrap items-center justify-center gap-2 overflow-x-auto border-t border-paper-200 pt-6"
		aria-label="分页"
	>
		{#if currentPage > 1}
			<Button tag="a" href={href(1)} outline size="xs" aria-label="首页" title="首页">
				<svg aria-hidden="true" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="m11 17-5-5 5-5m7 10-5-5 5-5" />
				</svg>
			</Button>
			<Button tag="a" href={href(currentPage - 1)} outline size="xs" aria-label="上一页" title="上一页">
				<svg aria-hidden="true" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="m15 19-7-7 7-7" />
				</svg>
			</Button>
		{:else}
			<Button disabled outline size="xs" aria-label="首页">
				<svg aria-hidden="true" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="m11 17-5-5 5-5m7 10-5-5 5-5" />
				</svg>
			</Button>
			<Button disabled outline size="xs" aria-label="上一页">
				<svg aria-hidden="true" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="m15 19-7-7 7-7" />
				</svg>
			</Button>
		{/if}

		<form class="flex shrink-0 items-center gap-2 whitespace-nowrap" onsubmit={jumpToPage}>
			<label for="page-jump" class="text-sm text-ink-500">第</label>
			<Input
				id="page-jump"
				name="page"
				type="number"
				min="1"
				max={totalPages}
				value={String(currentPage)}
				aria-label="跳转到页码"
				class="w-16 border-paper-300 bg-paper-100 text-center text-ink-900"
			/>
			<span class="text-sm text-ink-500">/ {totalPages} 页</span>
			<Button type="submit" outline size="xs" class="shrink-0">跳转</Button>
		</form>

		{#if currentPage < totalPages}
			<Button tag="a" href={href(currentPage + 1)} outline size="xs" aria-label="下一页" title="下一页">
				<svg aria-hidden="true" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="m9 5 7 7-7 7" />
				</svg>
			</Button>
			<Button tag="a" href={href(totalPages)} outline size="xs" aria-label="末页" title="末页">
				<svg aria-hidden="true" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="m13 17 5-5-5-5M6 17l5-5-5-5" />
				</svg>
			</Button>
		{:else}
			<Button disabled outline size="xs" aria-label="下一页">
				<svg aria-hidden="true" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="m9 5 7 7-7 7" />
				</svg>
			</Button>
			<Button disabled outline size="xs" aria-label="末页">
				<svg aria-hidden="true" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="m13 17 5-5-5-5M6 17l5-5-5-5" />
				</svg>
			</Button>
		{/if}
	</nav>
{/if}
