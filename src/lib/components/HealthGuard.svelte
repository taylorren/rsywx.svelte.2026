<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { health } from '$lib/health';
	import Button from 'flowbite-svelte/Button.svelte';

	/**
	 * Inverted health indicator.
	 *
	 * Shows NOTHING while the API is healthy (a permanent "online" pill is noise).
	 * Only when `/health` reports bad / unreachable does an alarming banner appear,
	 * with a "retry" action. Runs client-side so SSR never blocks on it and the
	 * page is always served regardless of API health.
	 */
	type Status = 'checking' | 'ok' | 'bad';

	let status = $state<Status>('checking');
	let message = $state('');

	const POLL_MS = 60_000;

	async function check() {
		if (!browser) return;
		status = 'checking';
		try {
			await health();
			status = 'ok';
		} catch (e) {
			status = 'bad';
			message = e instanceof Error ? e.message : 'API 无法访问';
		}
	}

	onMount(() => {
		check();
		const id = setInterval(check, POLL_MS);
		return () => clearInterval(id);
	});

	$effect(() => {
		if (status === 'bad') {
			// could raise a toast / analytics hook here later
		}
	});
</script>

{#if status === 'bad'}
	<div
		role="alert"
		class="flex w-full items-center justify-between gap-4 border-b border-red-300 bg-red-600 px-5 py-3 text-white"
	>
		<div class="flex min-w-0 items-center gap-3">
			<span class="shrink-0 font-bold">⚠</span>
			<p class="min-w-0 text-sm">
				数据服务暂时不可用{message ? `（${message}）` : ''}，内容可能无法加载。
			</p>
		</div>
		<Button
			type="button"
			onclick={check}
			outline
			size="xs"
			class="shrink-0 border border-white/40 bg-transparent text-white hover:bg-white/10"
		>
			重试
		</Button>
	</div>
{/if}