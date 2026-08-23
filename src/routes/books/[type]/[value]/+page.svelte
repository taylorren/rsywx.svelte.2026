<script lang="ts">
	import BooksList from '$lib/components/BooksList.svelte';

	let { data } = $props();

	function pageHref(page: number): string {
		const base = `/books/${data.search.type}/${encodeURIComponent(data.search.query)}`;
		return page === 1 ? base : `${base}/${page}`;
	}
</script>

<svelte:head>
	<title>{data.metadata.title}</title>
	<meta name="description" content={data.metadata.description} />
</svelte:head>

<BooksList results={data.results} search={data.search} {pageHref} />
