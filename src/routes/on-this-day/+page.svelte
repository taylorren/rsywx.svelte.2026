<script lang="ts">
	import BookTile from '$lib/components/BookTile.svelte';

	let { data } = $props();

	const dateLabel = $derived(
		data.dateInfo?.requested_date
			? new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric' }).format(
					new Date(`${data.dateInfo.requested_date}T00:00:00`)
				)
			: '今天'
	);
</script>

<svelte:head>
	<title>{data.metadata.title}</title>
	<meta name="description" content={data.metadata.description} />
</svelte:head>

<section class="flex flex-col gap-12">
	<div>
		<p class="text-sm font-medium tracking-wide text-leaf-700">ON THIS DAY</p>
		<h1 class="mt-2 font-display text-4xl font-semibold text-ink-900">此日 · {dateLabel}</h1>
		<p class="mt-2 text-ink-700">翻开在同一天留下的藏书与文字记忆。</p>
	</div>

	<section>
		<div class="mb-4 flex items-baseline gap-3">
			<h2 class="font-display text-2xl font-semibold text-ink-900">此日购书</h2>
			<p class="text-base font-semibold text-leaf-700">{data.books.length} 册</p>
		</div>
		{#if data.books.length}
			<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
				{#each data.books as book (book.bookid)}
					<BookTile {book} showTag sub={`${book.years_ago} 年前`} />
				{/each}
			</div>
		{:else}
			<p class="rounded-lg border border-dashed border-paper-300 p-8 text-center text-ink-500">
				这一天没有购书记录。
			</p>
		{/if}
	</section>

	<section>
		<div class="mb-4 flex items-baseline gap-3">
			<h2 class="font-display text-2xl font-semibold text-ink-900">此日文字</h2>
			<p class="text-base font-semibold text-leaf-700">{data.posts.length} 篇</p>
		</div>
		{#if data.posts.length}
			<div class="grid gap-4 md:grid-cols-2">
				{#each data.posts as post (post.ID)}
					<a
						href={post.permalink}
						target="_blank"
						rel="noopener noreferrer"
						class="rounded-xl border border-paper-200 bg-paper-100 p-5 transition hover:-translate-y-0.5 hover:shadow-soft"
					>
						<p class="text-sm text-ink-500">{post.post_date.slice(0, 10)} · {post.years_ago} 年前</p>
						<h3 class="mt-2 font-display text-xl font-semibold text-ink-900">{post.post_title}</h3>
						{#if post.post_excerpt}
							<p class="mt-3 line-clamp-3 text-sm leading-relaxed text-ink-700">{post.post_excerpt}</p>
						{/if}
					</a>
				{/each}
			</div>
		{:else}
			<p class="rounded-lg border border-dashed border-paper-300 p-8 text-center text-ink-500">
				这一天没有文章记录。
			</p>
		{/if}
	</section>
</section>
