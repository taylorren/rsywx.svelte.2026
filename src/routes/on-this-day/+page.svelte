<script lang="ts">
	let { data } = $props();

	const dateLabel = $derived(
		data.dateInfo?.requested_date
			? new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric' }).format(
					new Date(`${data.dateInfo.requested_date}T00:00:00`)
				)
			: '今天'
	);

	const coverSrc = (book: { bookid: string; cover_uri: string | null }) =>
		book.cover_uri ?? `/covers/${book.bookid}.jpg`;
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
			<ul class="divide-y divide-paper-200 overflow-hidden rounded-xl border border-paper-200 bg-paper-100">
				{#each data.books as book (book.bookid)}
					<li class="flex items-center gap-4 p-3 transition hover:bg-paper-200">
						<a
							href={`/books/${book.bookid}.html`}
							class="block shrink-0 overflow-hidden rounded-md bg-paper-200"
						>
							<img
								src={coverSrc(book)}
								alt={book.title}
								loading="lazy"
								class="h-20 w-14 object-cover"
							/>
						</a>
						<div class="min-w-0 flex-1">
							<h3 class="truncate font-display text-lg font-semibold text-ink-900">
								<a
									href={`/books/${book.bookid}.html`}
									class="transition hover:text-leaf-700"
								>
									{book.title}
								</a>
							</h3>
							<p class="mt-1 truncate text-sm text-ink-500">
								{book.author}{book.years_ago ? ` · ${book.years_ago} 年前购入` : ''}
							</p>
						</div>
					</li>
				{/each}
			</ul>
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
			<ul class="divide-y divide-paper-200 overflow-hidden rounded-xl border border-paper-200 bg-paper-100">
				{#each data.posts as post (post.ID)}
					<li class="flex gap-4 p-4 transition hover:bg-paper-200">
						<a
							href={post.permalink}
							target="_blank"
							rel="noopener noreferrer"
							class="block w-28 shrink-0 overflow-hidden rounded-md bg-paper-200"
						>
							<img
								src={post.feature_image ?? '/images/tr.webp'}
								alt={post.post_title}
								loading="lazy"
								class="aspect-[2/1] w-full object-cover"
							/>
						</a>
						<div class="min-w-0 flex-1">
							<a
								href={post.permalink}
								target="_blank"
								rel="noopener noreferrer"
							>
								<h3 class="font-display text-lg font-semibold text-ink-900 transition hover:text-leaf-700">
									{post.post_title}
								</h3>
							</a>
							<p class="mt-1 text-sm text-ink-500">{post.post_date.slice(0, 10)} · {post.years_ago} 年前</p>
							{#if post.post_excerpt}
								<p class="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-700">{post.post_excerpt}</p>
							{/if}
						</div>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="rounded-lg border border-dashed border-paper-300 p-8 text-center text-ink-500">
				这一天没有文章记录。
			</p>
		{/if}
	</section>
</section>
