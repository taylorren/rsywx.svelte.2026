<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';

	let { children } = $props();

	const year = new Date().getFullYear();
	const nav = [
		{ href: '/', label: '首页' },
		{ href: '/books', label: '藏书' },
		{ href: '/reviews', label: '读书' },
		{ href: '/on-this-day', label: '博客' },
		{ href: '/stats', label: '统计' }
	];
</script>

<svelte:head>
	<title>任氏有无轩</title>
	<meta name="description" content="任氏有无轩 — 藏书、读书、博客。" />
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="flex min-h-screen flex-col">
	<header class="border-b border-paper-200 bg-paper-50/80 backdrop-blur">
		<div class="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
			<a href="/" class="font-display text-2xl font-semibold tracking-tight text-ink-900">
				任氏有无轩
			</a>
			<div class="flex items-center gap-3">
				<nav class="flex items-center gap-6 text-sm text-ink-700">
					{#each nav as item (item.href)}
						<a href={item.href} class="transition hover:text-leaf-600">
							{item.label}
						</a>
					{/each}
				</nav>
				<ThemeToggle />
			</div>
		</div>
	</header>

	<main class="mx-auto w-full max-w-6xl flex-1 px-5 py-8">
		{@render children()}
	</main>

	<footer class="border-t border-paper-200 bg-paper-100">
		<div class="mx-auto flex max-w-6xl flex-col items-center gap-3 px-5 py-10 text-center">
			<p class="font-display text-xl font-semibold text-ink-900">任氏有无轩</p>
			<p class="text-sm text-ink-500">
				© 1989 - {year} 任氏有无轩
			</p>
			<a
				href="https://creativecommons.org/licenses/by-nc-nd/4.0/"
				target="_blank"
				rel="noopener noreferrer"
				class="text-sm text-ink-500 underline-offset-2 hover:text-leaf-600 hover:underline"
			>
				本站点按照 CC BY-NC-ND-SA 4.0 许可证发布
			</a>
			<p class="text-xs text-ink-500">技术框架： SvelteKit · Tailwind CSS · Flowbite Svelte</p>
		</div>
	</footer>
</div>
