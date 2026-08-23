<script lang="ts">
	/**
	 * Compact ranked list of books (top-N style).
	 * Renders a row per book: rank, title (link to detail), author, and a
	 * right-aligned metric line. The metric is arbitrary text supplied by the
	 * caller (e.g. "1,234 次访问" or "180 天未读").
	 */
	interface RankedBook {
		bookid: string;
		title: string;
		author: string;
		/** Present on `/books/last_visited` & `/books/forgotten`. */
		last_visited?: string | null;
		/** Present on visit-counted endpoints. */
		total_visits?: number;
		/** Present on `/books/forgotten`. */
		days_since_visit?: number;
	}

	let {
		items,
		metric,
		sub
	}: {
		items: RankedBook[];
		/** Text shown on the right of each row (e.g. visit count / days ago). */
		metric: (book: RankedBook) => string;
		/** Optional secondary line under the metric (e.g. a date). */
		sub?: (book: RankedBook) => string;
	} = $props();
</script>

<ol class="divide-y divide-paper-200">
	{#each items as book, i (book.bookid + '-' + i)}
		<li class="flex items-center gap-4 px-2 py-3">
			<span
				class="w-8 shrink-0 text-right font-mono text-sm tabular-nums text-ink-400 dark:text-ink-500"
			>
				{i + 1}
			</span>
			<div class="min-w-0 flex-1">
				<a
					href={`/books/${book.bookid}.html`}
					class="block truncate font-medium text-ink-900 transition-colors hover:text-leaf-700 dark:text-ink-100 dark:hover:text-leaf-700"
					title={book.title}
				>
					{book.title}
				</a>
				<p class="truncate text-xs text-ink-500 dark:text-ink-400">{book.author}</p>
			</div>
			<div class="shrink-0 text-right">
				<p class="text-sm font-medium tabular-nums text-leaf-700 dark:text-leaf-700">
					{metric(book)}
				</p>
				{#if sub}
					<p class="text-xs text-ink-400 dark:text-ink-500">{sub(book)}</p>
				{/if}
			</div>
		</li>
	{/each}
</ol>
