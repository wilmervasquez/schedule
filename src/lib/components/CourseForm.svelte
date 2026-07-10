<script lang="ts">
	import type { Course, Day, ScheduleBlock } from '$lib/types';
	import { DAYS, DAY_LABELS, generateTimeSlots } from '$lib/types';
	import Select from '$lib/components/Select.svelte';
	import Plus from '@lucide/svelte/icons/plus';
	import X from '@lucide/svelte/icons/x';
	import Check from '@lucide/svelte/icons/check';

	interface Props {
		course?: Course | null;
		onSave: (course: Omit<Course, 'id'> & { id?: string }) => void;
		onCancel: () => void;
		checkConflict: (
			day: Day,
			startSlot: number,
			endSlot: number,
			section: string,
			excludeId?: string
		) => Course | null;
	}

	let { course = null, onSave, onCancel, checkConflict }: Props = $props();

	const timeSlots = generateTimeSlots();

	const dayOptions = DAYS.map((d) => ({ value: d, label: DAY_LABELS[d] }));
	const startSlotOptions = timeSlots.map((s) => ({ value: String(s.index), label: s.label }));
	function endSlotOptions(startSlot: number) {
		return timeSlots
			.filter((s) => s.index > startSlot)
			.map((s) => ({
				value: String(s.index + 1),
				label: timeSlots[s.index + 1] ? timeSlots[s.index + 1].label : 'Fin'
			}));
	}

	let name = $state('');
	let credits = $state(3);
	let color = $state('#6366f1');
	let section = $state('');
	let cycle = $state('2026-I');
	let blocks = $state<ScheduleBlock[]>([{ day: 'monday' as Day, startSlot: 0, endSlot: 1 }]);
	let error = $state('');

	$effect(() => {
		const c = course;
		if (c) {
			name = c.name;
			credits = c.credits;
			color = c.color;
			section = c.section;
			cycle = c.cycle;
			blocks = [...c.blocks];
		}
	});

	function addBlock() {
		blocks = [...blocks, { day: 'monday' as Day, startSlot: 0, endSlot: 1 }];
	}

	function removeBlock(index: number) {
		if (blocks.length <= 1) return;
		blocks = blocks.filter((_, i) => i !== index);
	}

	function updateBlockDay(index: number, day: string) {
		blocks = blocks.map((b, i) => (i === index ? { ...b, day: day as Day } : b));
	}

	function updateBlockStart(index: number, slotStr: string) {
		const startSlot = parseInt(slotStr);
		blocks = blocks.map((b, i) =>
			i === index ? { ...b, startSlot, endSlot: Math.max(b.endSlot, startSlot + 1) } : b
		);
	}

	function updateBlockEnd(index: number, slotStr: string) {
		const endSlot = parseInt(slotStr);
		blocks = blocks.map((b, i) => (i === index ? { ...b, endSlot } : b));
	}

	function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';

		if (!name.trim()) {
			error = 'El nombre del curso es obligatorio';
			return;
		}

		for (let i = 0; i < blocks.length; i++) {
			const block = blocks[i];
			if (block.startSlot >= block.endSlot) {
				error = `El bloque ${i + 1}: la hora de fin debe ser posterior a la de inicio`;
				return;
			}
		}

		for (let i = 0; i < blocks.length; i++) {
			const block = blocks[i];
			const conflict = checkConflict(
				block.day,
				block.startSlot,
				block.endSlot,
				section.trim(),
				course?.id
			);
			if (conflict) {
				error = `Conflicto en ${DAY_LABELS[block.day]}: hay un cruce con "${conflict.name}" (misma seccion)`;
				return;
			}
		}

		onSave({
			...(course ? { id: course.id } : {}),
			name: name.trim(),
			credits,
			color,
			section: section.trim(),
			cycle: cycle.trim(),
			blocks
		});
	}
</script>

<div class="card card--default">
	<div class="card__header">
		<h2 class="card__title">{course ? 'Editar Curso' : 'Agregar Curso'}</h2>
	</div>
	<form class="card__content gap-4" onsubmit={handleSubmit}>
		<div class="flex flex-col gap-1">
			<label for="course-name" class="label">Nombre del curso</label>
			<input
				id="course-name"
				type="text"
				class="input"
				placeholder="Ej: Calculo I"
				bind:value={name}
				required
			/>
		</div>

		<div class="grid grid-cols-2 gap-3">
			<div class="flex flex-col gap-1">
				<label for="course-credits" class="label">Creditos</label>
				<input
					id="course-credits"
					type="number"
					class="input"
					min="1"
					max="10"
					bind:value={credits}
					required
				/>
			</div>
			<div class="flex flex-col gap-1">
				<label for="course-section" class="label">Seccion</label>
				<input
					id="course-section"
					type="text"
					class="input"
					placeholder="Ej: A1"
					bind:value={section}
				/>
			</div>
		</div>

		<div class="grid grid-cols-2 gap-3">
			<div class="flex flex-col gap-1">
				<label for="course-cycle" class="label">Ciclo</label>
				<input
					id="course-cycle"
					type="text"
					class="input"
					placeholder="Ej: 2026-I"
					bind:value={cycle}
				/>
			</div>
			<div class="flex flex-col gap-1">
				<label for="course-color" class="label">Color</label>
				<div class="flex items-center gap-2">
					<input
						id="course-color"
						type="color"
						class="h-10 w-14 cursor-pointer rounded-field border-0"
						bind:value={color}
					/>
					<span class="text-xs text-muted">{color}</span>
				</div>
			</div>
		</div>

		<div class="flex flex-col gap-2">
			<div class="flex items-center justify-between">
				<span class="label">Horarios</span>
				<button
					type="button"
					class="button button--sm button--secondary flex items-center gap-1"
					onclick={addBlock}
				>
					<Plus size={14} />
					Agregar bloque
				</button>
			</div>

			{#each blocks as block, i (i)}
				<div class="flex flex-wrap items-end gap-2 rounded-lg bg-surface-secondary p-2">
					<span class="text-xs font-medium text-muted">Bloque {i + 1}:</span>

					<div class="w-[130px]">
						<Select value={block.day} options={dayOptions} onChange={(v) => updateBlockDay(i, v)} />
					</div>

					<div class="w-[120px]">
						<Select
							value={String(block.startSlot)}
							options={startSlotOptions}
							onChange={(v) => updateBlockStart(i, v)}
						/>
					</div>

					<span class="text-xs text-muted">a</span>

					<div class="w-[120px]">
						<Select
							value={String(block.endSlot)}
							options={endSlotOptions(block.startSlot)}
							onChange={(v) => updateBlockEnd(i, v)}
						/>
					</div>

					{#if blocks.length > 1}
						<button
							type="button"
							class="button button--sm button--danger ml-auto"
							onclick={() => removeBlock(i)}
						>
							<X size={14} />
						</button>
					{/if}
				</div>
			{/each}
		</div>

		{#if error}
			<div class="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger-foreground">
				{error}
			</div>
		{/if}

		<div class="card__footer gap-2 pt-2">
			<button type="submit" class="button button--primary flex items-center gap-1.5">
				<Check size={16} />
				{course ? 'Guardar Cambios' : 'Agregar Curso'}
			</button>
			<button type="button" class="button button--secondary" onclick={onCancel}> Cancelar </button>
		</div>
	</form>
</div>
