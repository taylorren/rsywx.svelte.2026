<script lang="ts">
	interface BookCard {
		bookid: string;
		title: string;
		author: string;
		cover_uri?: string | null;
		tags?: string[];
	}

	let { book, showTag = false, sub = '' }: { book: BookCard; showTag?: boolean; sub?: string } =
		$props();

	let useRemoteCover = $state(false);
	let coverUnavailable = $state(false);

	function handleCoverError() {
		if (!useRemoteCover && book.cover_uri) {
			useRemoteCover = true;
			return;
		}
		coverUnavailable = true;
	}
</script>

<a
	href={`/books/${book.bookid}.html`}
	class="group flex flex-col overflow-hidden rounded-xl border border-paper-200 bg-paper-100 transition hover:-translate-y-0.5 hover:shadow-soft"
>
	<div class="relative aspect-[3/4] w-full overflow-hidden bg-paper-200">
		{#if !coverUnavailable}
			<img
				src={useRemoteCover ? book.cover_uri : `/covers/${book.bookid}.jpg`}
				alt={book.title}
				loading="lazy"
				onerror={handleCoverError}
				class="h-full w-full object-cover transition group-hover:scale-105"
			/>
		{:else}
			<div class="flex h-full w-full items-center justify-center bg-paper-200 p-3 text-center">
				<span class="line-clamp-4 font-display text-lg text-ink-500">{book.title}</span>
			</div>
		{/if}
	</div>
	<div class="flex flex-1 flex-col gap-1 p-3">
		<h3 class="line-clamp-2 font-display text-base font-medium leading-snug text-ink-900">
			{book.title}
		</h3>
		<p class="line-clamp-1 text-sm text-ink-500">{book.author || '佚名'}</p>
		{#if sub}
			<p class="text-xs text-ochre-500">{sub}</p>
		{/if}
		{#if showTag && book.tags?.length}
			<p class="mt-1 flex flex-wrap gap-1">
				{#each book.tags.slice(0, 3) as tag}
					<span class="rounded-full bg-leaf-100 px-2 py-0.5 text-xs text-leaf-700">{tag}</span>
				{/each}
			</p>
		{/if}
	</div>
</a>