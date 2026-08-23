<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from 'flowbite-svelte/Button.svelte';
	import Input from 'flowbite-svelte/Input.svelte';
	import Select from 'flowbite-svelte/Select.svelte';
	import Pagination from '$lib/components/Pagination.svelte';
	import type { BookListItem, BookSearchType } from '$lib/types';
	import type { Pagination as PaginationData } from '$lib/types';

	let {
		results,
		search,
		pageHref
	}: {
		results: { items: BookListItem[]; pagination: PaginationData };
		search: { type: BookSearchType; query: string };
		pageHref: (page: number) => string;
	} = $props();

	const searchTypes: { value: BookSearchType; label: string }[] = [
		{ value: 'title', label: '书名' },
		{ value: 'author', label: '作者' },
		{ value: 'tag', label: '标签' }
	];

	function authorHref(author: string): string {
		return `/books/author/${encodeURIComponent(author)}`;
	}

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		const form = event.currentTarget as HTMLFormElement;
		const formData = new FormData(form);
		const type = String(formData.get('type') || 'title');
		const q = String(formData.get('q') || '').trim();
		goto(q ? `/books/${type}/${encodeURIComponent(q)}` : '/books');
	}
</script>

<section class="flex flex-col gap-8">
	<div>
		<h1 class="font-display text-4xl font-semibold text-ink-900">藏书</h1>
		<p class="mt-2 text-ink-700">在书架间慢慢寻一册想读的书。</p>
	</div>

	<form class="flex flex-col gap-3 sm:flex-row" onsubmit={handleSubmit}>
		<label class="sr-only" for="search-type">搜索范围</label>
		<div class="w-28 shrink-0">
			<Select
				id="search-type"
				name="type"
				value={search.type}
				placeholder=""
				classes={{ select: "border-paper-300 bg-paper-100 text-ink-900 focus:border-leaf-600 dark:border-paper-300 dark:bg-paper-100 dark:text-ink-900 dark:focus:border-leaf-600" }}
			>
				{#each searchTypes as searchType}
					<option value={searchType.value}>{searchType.label}</option>
				{/each}
			</Select>
		</div>
		<label class="sr-only" for="book-search">搜索藏书</label>
		<Input
			id="book-search"
			name="q"
			value={search.query}
			placeholder="输入书名、作者或标签"
			class="min-w-0 flex-1 border-paper-300 bg-paper-100 text-ink-900 placeholder:text-ink-500 focus:border-leaf-600"
		/>
		<Button
			type="submit"
			class="bg-leaf-600 hover:bg-leaf-700"
		>
			搜索
		</Button>
	</form>

	<div class="flex items-baseline justify-between gap-4">
		<h2 class="font-display text-xl font-semibold text-ink-900">
			{search.query ? `“${search.query}” 的搜索结果` : '全部藏书'}
		</h2>
		<p class="shrink-0 text-sm text-ink-500">{results.pagination.total_results} 册</p>
	</div>

	{#if results.items.length}
		<div class="overflow-x-auto rounded-xl border border-paper-200 bg-paper-100 shadow-soft">
			<table class="w-full table-fixed text-sm">
				<colgroup>
					<col class="w-20" />
					<col />
					<col class="w-44" />
					<col class="w-20" />
				</colgroup>
				<thead>
					<tr class="border-b border-paper-200 text-left text-xs uppercase tracking-wider text-ink-500">
						<th scope="col" class="px-5 py-3 font-medium">书号</th>
						<th scope="col" class="px-5 py-3 font-medium">书名</th>
						<th scope="col" class="px-5 py-3 font-medium">作者</th>
						<th scope="col" class="px-5 py-3 font-medium">位置</th>
					</tr>
				</thead>
				<tbody>
					{#each results.items as book (book.bookid)}
						<tr
							class="border-b border-paper-200 transition-colors last:border-0 hover:bg-paper-200/60 dark:hover:bg-paper-300/30"
						>
							<td class="whitespace-nowrap px-5 py-3">
								<a
									href={`/books/${book.bookid}.html`}
									class="font-mono text-xs tabular-nums text-ink-500 transition-colors hover:text-leaf-700 dark:hover:text-leaf-700"
								>
									{book.bookid}
								</a>
							</td>
							<td class="px-5 py-3">
								<a
									href={`/books/${book.bookid}.html`}
									class="block truncate font-medium text-ink-900 transition-colors hover:text-leaf-700 dark:text-ink-100 dark:hover:text-leaf-700"
									title={book.title}
								>
									{book.title}
								</a>
							</td>
							<td class="whitespace-nowrap px-5 py-3">
								<a
									href={authorHref(book.author)}
									class="block truncate text-ink-700 transition-colors hover:text-leaf-700 dark:text-ink-300 dark:hover:text-leaf-700"
									title={`${book.region ?? ''} ${book.author}`}
								>
									{#if book.region}
										<span class="text-ink-400 dark:text-ink-500">【{book.region}】</span>
									{/if}
									{book.author}
								</a>
							</td>
							<td class="whitespace-nowrap px-5 py-3">
								<span
									class="inline-block rounded-md border border-leaf-600/25 bg-leaf-100 px-2 py-0.5 font-mono text-xs font-medium text-leaf-700 dark:border-leaf-600/40 dark:bg-leaf-100 dark:text-leaf-700"
								>
									{book.location ?? '—'}
								</span>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{:else}
		<p class="rounded-lg border border-dashed border-paper-300 p-10 text-center text-ink-500">
			没有找到匹配的藏书。
		</p>
	{/if}

	<Pagination
		currentPage={results.pagination.current_page}
		totalPages={results.pagination.total_pages}
		href={pageHref}
	/>
</section>
