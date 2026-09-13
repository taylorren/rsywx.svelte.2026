<script lang="ts">
	import { browser } from '$app/environment';
	import { setStore, KEYS } from '$lib/storage';
	import Button from 'flowbite-svelte/Button.svelte';

	let theme = $state<'light' | 'dark'>('light');

	if (browser) {
		theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
	}

	function toggle() {
		theme = theme === 'dark' ? 'light' : 'dark';
		document.documentElement.classList.toggle('dark', theme === 'dark');
		setStore(KEYS.theme, theme);
	}
</script>

<Button
	type="button"
	onclick={toggle}
	aria-label={theme === 'dark' ? '切换到亮色模式' : '切换到暗色模式'}
	title={theme === 'dark' ? '切换到亮色模式' : '切换到暗色模式'}
	outline
	size="xs"
	class="h-9 w-9 p-0 border border-paper-200 bg-paper-50 text-ink-700 transition hover:text-leaf-600"
>
	{#if theme === 'dark'}
		<!-- sun -->
		<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="4"/><path stroke-linecap="round" d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
	{:else}
		<!-- moon -->
		<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
	{/if}
</Button>