<script lang="ts">
	import Pagination from '$lib/components/Pagination.svelte';

	let { data } = $props();

	function pageHref(page: number): string {
		return page === 1 ? '/reviews' : `/reviews/${page}`;
	}

	/**
	 * A blog post can review several books, so multiple reviews may share the
	 * same `uri`. Key on uri + bookid so the keyed each block never collides
	 * (a duplicate key makes Svelte abort the update, freezing the page).
	 */
	function reviewKey(review: { uri: string; bookid: string }): string {
		return `${review.uri}#${review.bookid}`;
	}

	function handleCoverError(event: Event, remoteCover: string | null) {
		const image = event.currentTarget as HTMLImageElement;
		if (remoteCover && image.src !== remoteCover) {
			image.src = remoteCover;
			return;
		}
		image.src = '/images/reading.webp';
	}
</script>

<svelte:head>
	<title>{data.metadata.title}</title>
	<meta name="description" content={data.metadata.description} />
</svelte:head>

<section class="flex flex-col gap-8">
	<div>
		<h1 class="font-display text-4xl font-semibold text-ink-900">读书</h1>
		<p class="mt-2 text-ink-700">读过的书，留下的字。</p>
	</div>

	{#if data.reviews.length}
		<div class="grid gap-5 md:grid-cols-3">
			{#each data.reviews as review (reviewKey(review))}
				<article
					class="flex flex-col overflow-hidden rounded-xl border border-paper-200 bg-paper-100 transition hover:shadow-soft"
				>
					<a
						href={review.uri}
						target="_blank"
						rel="noopener noreferrer"
						class="group grid flex-1 sm:grid-cols-[112px_1fr]"
					>
						<div class="aspect-[3/4] bg-paper-200 sm:aspect-auto">
							{#if review.cover_uri}
								<img
									src={`/covers/${review.bookid}.jpg`}
									alt={review.book_title}
									loading="lazy"
									onerror={(event) => handleCoverError(event, review.cover_uri)}
									class="h-full w-full object-cover"
								/>
							{:else}
								<img
									src="/images/reading.webp"
									alt=""
									loading="lazy"
									class="h-full w-full object-cover opacity-60"
								/>
							{/if}
						</div>
						<div class="flex flex-col p-5">
							<p class="text-sm text-ink-500">{review.datein}</p>
							<h2 class="mt-2 font-display text-xl font-semibold text-ink-900 group-hover:text-leaf-700">
								{review.title}
							</h2>
							<p class="mt-4 text-sm font-medium text-leaf-700">阅读全文 →</p>
						</div>
					</a>
					<a
						href={`/books/${review.bookid}.html`}
						class="flex items-center gap-2 border-t border-paper-200 px-5 py-3 text-sm text-ink-700 transition hover:bg-paper-200 hover:text-ink-900"
					>
						<svg
							aria-hidden="true"
							class="h-4 w-4 shrink-0"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							stroke-width="1.5"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
							/>
						</svg>
						<span class="truncate">《{review.book_title}》</span>
						<span class="ml-auto shrink-0 text-leaf-700">藏书详情</span>
					</a>
				</article>
			{/each}
		</div>
	{:else}
		<p class="rounded-lg border border-dashed border-paper-300 p-10 text-center text-ink-500">
			暂无读书笔记。
		</p>
	{/if}

	<Pagination
		currentPage={data.pagination.current_page}
		totalPages={data.pagination.total_pages}
		href={pageHref}
	/>
</section>
