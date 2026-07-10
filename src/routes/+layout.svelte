<script lang="ts">
	import '../routes/layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/stores';
	import { PersistedState } from 'runed';
	import Calendar from '@lucide/svelte/icons/calendar';
	import BookOpen from '@lucide/svelte/icons/book-open';
	import Sun from '@lucide/svelte/icons/sun';
	import Moon from '@lucide/svelte/icons/moon';

	let { children } = $props();

	const navItems = [
		{ href: '/horario', label: 'Horario', Icon: Calendar },
		{ href: '/cursos', label: 'Cursos', Icon: BookOpen }
	];

	const darkMode = new PersistedState('theme-dark', false, { syncTabs: true });

	$effect(() => {
		if (darkMode.current) {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	});

	function toggleTheme() {
		darkMode.current = !darkMode.current;
	}
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="min-h-screen bg-background text-foreground" class:dark={darkMode.current}>
	<header class="flex items-center justify-between border-b border-separator bg-surface px-6 py-3">
		<div class="flex items-center gap-6">
			<h1 class="text-lg font-bold text-foreground">Mi Horario</h1>
			<nav class="flex gap-1">
				{#each navItems as item (item.href)}
					<a
						href={item.href}
						class="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors
							{$page.url.pathname.startsWith(item.href)
							? 'bg-accent text-accent-foreground'
							: 'text-muted hover:bg-surface-secondary hover:text-foreground'}"
					>
						<item.Icon size={16} />
						{item.label}
					</a>
				{/each}
			</nav>
		</div>

		<button class="button button--ghost button--sm flex items-center gap-1.5" onclick={toggleTheme}>
			{#if darkMode.current}
				<Sun size={16} />
				Claro
			{:else}
				<Moon size={16} />
				Oscuro
			{/if}
		</button>
	</header>

	<main class="mx-auto max-w-7xl p-6">
		{@render children()}
	</main>
</div>
