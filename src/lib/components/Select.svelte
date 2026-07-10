<script lang="ts">
	import { onClickOutside } from 'runed';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import Check from '@lucide/svelte/icons/check';

	interface Option {
		value: string;
		label: string;
	}

	interface Props {
		value: string;
		options: Option[];
		placeholder?: string;
		onChange?: (value: string) => void;
	}

	let { value, options, placeholder = 'Seleccionar...', onChange }: Props = $props();

	let open = $state(false);
	let triggerEl = $state<HTMLButtonElement>();
	let listEl = $state<HTMLDivElement>();

	const selected = $derived(options.find((o) => o.value === value));

	function select(option: Option) {
		value = option.value;
		open = false;
		onChange?.(option.value);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			open = false;
		} else if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			open = !open;
		} else if (e.key === 'ArrowDown' && open) {
			e.preventDefault();
			const items = listEl?.querySelectorAll('[role="option"]');
			const current = listEl?.querySelector('[aria-selected="true"]');
			const idx = current ? Array.from(items ?? []).indexOf(current as Element) : -1;
			const next = items?.[idx + 1] || items?.[0];
			(next as HTMLElement)?.focus();
		} else if (e.key === 'ArrowUp' && open) {
			e.preventDefault();
			const items = listEl?.querySelectorAll('[role="option"]');
			const current = listEl?.querySelector('[aria-selected="true"]');
			const idx = current
				? Array.from(items ?? []).indexOf(current as Element)
				: (items?.length ?? 0);
			const prev = items?.[idx - 1] || items?.[items.length - 1];
			(prev as HTMLElement)?.focus();
		}
	}

	onClickOutside(
		() => listEl,
		() => {
			open = false;
		}
	);
</script>

<div class="relative">
	<button
		bind:this={triggerEl}
		type="button"
		class="input flex w-full items-center justify-between gap-2 text-left"
		aria-haspopup="listbox"
		aria-expanded={open}
		onclick={() => (open = !open)}
		onkeydown={handleKeydown}
	>
		<span class={selected ? 'text-field-foreground' : 'text-field-placeholder'}>
			{selected ? selected.label : placeholder}
		</span>
		<ChevronDown
			size={16}
			class="shrink-0 text-muted transition-transform {open ? 'rotate-180' : ''}"
		/>
	</button>

	{#if open}
		<div
			bind:this={listEl}
			role="listbox"
			class="menu absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-separator bg-overlay shadow-overlay"
		>
			{#each options as option (option.value)}
				<div
					role="option"
					tabindex="-1"
					aria-selected={option.value === value}
					class="menu-item flex items-center justify-between"
					class:bg-accent-soft={option.value === value}
					onclick={() => select(option)}
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							select(option);
						}
					}}
				>
					<span>{option.label}</span>
					{#if option.value === value}
						<Check size={14} class="text-accent" />
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>
