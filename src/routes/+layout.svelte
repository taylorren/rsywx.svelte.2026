<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { page, navigating } from '$app/state';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import HealthGuard from '$lib/components/HealthGuard.svelte';

	let { children } = $props();

	const year = new Date().getFullYear();
	const nav = [
		{ href: '/', label: '首页' },
		{ href: '/books', label: '藏书' },
		{ href: '/reviews', label: '读书' },
		{ href: '/on-this-day', label: '博客' },
		{ href: '/stats', label: '统计' }
	];
	const familyAvatars = [
		{ src: '/images/tr.webp', label: 'TR' },
		{ src: '/images/gr.webp', label: 'GR' },
		{ src: '/images/pr.webp', label: 'PR' },
		{ src: '/images/rt.webp', label: 'Rafael' }
	];

	/** True when the current route belongs to this nav item. */
	function isActive(href: string): boolean {
		const path = page.url.pathname;
		if (href === '/') return path === '/';
		return path === href || path.startsWith(href + '/');
	}
</script>

<svelte:head>
	<title>任氏有无轩</title>
	<meta name="description" content="任氏有无轩 — 藏书、读书、博客。" />
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="flex min-h-screen flex-col">
	<a
		href="#main"
		class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-paper-50 focus:px-4 focus:py-2 focus:font-medium focus:text-leaf-700 focus:shadow-soft"
	>
		跳到主要内容
	</a>
	{#if navigating.to !== null}
		<div
			class="fixed inset-x-0 top-0 z-[60] h-0.5 overflow-hidden motion-reduce:hidden"
			aria-hidden="true"
		>
			<div class="h-full w-1/3 animate-[progress-slide_1.1s_ease-in-out_infinite] bg-leaf-600"></div>
		</div>
	{/if}
	<HealthGuard />
	<header class="border-b border-paper-200 bg-paper-50/80 backdrop-blur">
		<div class="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
			<a href="/" class="flex items-center gap-2.5 font-display text-2xl font-semibold tracking-tight text-ink-900">
				<img src="/images/logo.svg" alt="" class="h-9 w-9" />
				<span>任氏有无轩</span>
			</a>
			<div class="flex items-center gap-3">
				<nav class="flex items-center gap-6 text-sm text-ink-700" aria-label="主导航">
					{#each nav as item (item.href)}
						<a
							href={item.href}
							class="transition hover:text-leaf-600 {isActive(item.href)
								? 'font-medium text-leaf-700'
								: ''}"
							aria-current={isActive(item.href) ? 'page' : undefined}
						>
							{item.label}
						</a>
					{/each}
				</nav>
				<ThemeToggle />
			</div>
		</div>
	</header>

	<main id="main" tabindex="-1" class="mx-auto w-full max-w-6xl flex-1 px-5 py-8 focus:outline-none">
		{@render children()}
	</main>

	<footer class="border-t border-paper-200 bg-paper-100">
		<div class="mx-auto flex max-w-6xl flex-col items-center gap-3 px-5 py-10 text-center">
			<a href="/" class="flex items-center gap-2 font-display text-xl font-semibold text-ink-900">
				<img src="/images/logo.svg" alt="" class="h-8 w-8" />
				<span>任氏有无轩</span>
			</a>
			<div class="flex -space-x-3" aria-label="家庭成员">
				{#each familyAvatars as avatar}
					<img
						src={avatar.src}
						alt={avatar.label}
						class="h-16 w-16 rounded-full border-2 border-paper-100 object-cover"
					/>
				{/each}
			</div>
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
