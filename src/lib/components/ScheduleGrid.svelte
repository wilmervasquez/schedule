<script lang="ts">
	import type { Course, Day } from '$lib/types';
	import { DAYS, DAY_LABELS, generateTimeSlots } from '$lib/types';
	import { goto } from '$app/navigation';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash2 from '@lucide/svelte/icons/trash-2';

	interface Props {
		courses: Course[];
		onDelete: (id: string) => void;
	}

	let { courses, onDelete }: Props = $props();

	const timeSlots = generateTimeSlots();

	let hoveredCourse = $state<Course | null>(null);
	let tooltipPos = $state({ x: 0, y: 0 });
	let hoveredDay = $state<Day | null>(null);
	let hoveredSlot = $state<number | null>(null);

	function getCourseAt(day: Day, slot: number): Course | null {
		for (const course of courses) {
			for (const block of course.blocks) {
				if (block.day === day && slot >= block.startSlot && slot < block.endSlot) {
					return course;
				}
			}
		}
		return null;
	}

	function getBlockInfo(
		course: Course,
		day: Day,
		slot: number
	): { start: number; end: number; isFirst: boolean } | null {
		for (const block of course.blocks) {
			if (block.day === day && slot >= block.startSlot && slot < block.endSlot) {
				return {
					start: block.startSlot,
					end: block.endSlot,
					isFirst: slot === block.startSlot
				};
			}
		}
		return null;
	}

	function handleCellHover(e: MouseEvent, day: Day, slot: number) {
		const course = getCourseAt(day, slot);
		if (course) {
			hoveredCourse = course;
			hoveredDay = day;
			hoveredSlot = slot;
			const rect = (e.target as HTMLElement).getBoundingClientRect();
			tooltipPos = { x: rect.left + rect.width / 2, y: rect.top };
		} else {
			hoveredCourse = null;
			hoveredDay = null;
			hoveredSlot = null;
		}
	}

	function handleCellLeave() {
		hoveredCourse = null;
		hoveredDay = null;
		hoveredSlot = null;
	}

	function getTextColor(bgColor: string): string {
		const hex = bgColor.replace('#', '');
		const r = parseInt(hex.substring(0, 2), 16);
		const g = parseInt(hex.substring(2, 4), 16);
		const b = parseInt(hex.substring(4, 6), 16);
		const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
		return luminance > 0.5 ? '#1a1a2e' : '#ffffff';
	}

	function handleEdit(day: Day, slot: number) {
		const course = getCourseAt(day, slot);
		if (course) goto(`/cursos/${course.id}`);
	}
</script>

<div class="schedule-container relative overflow-x-auto" id="schedule-grid">
	<table class="w-full border-collapse">
		<thead>
			<tr>
				<th
					class="sticky left-0 z-20 w-24 min-w-[96px] border-b border-separator bg-surface p-2 text-xs font-medium text-muted"
				>
					Hora
				</th>
				{#each DAYS as day (day)}
					<th
						class="min-w-[130px] border-b border-separator bg-surface p-2 text-center text-xs font-medium text-muted"
					>
						{DAY_LABELS[day]}
					</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each timeSlots as slot (slot.index)}
				<tr>
					<td
						class="sticky left-0 z-10 w-24 min-w-[96px] border-b border-separator bg-surface px-2 py-1 text-right text-xs text-muted"
					>
						{slot.label}
					</td>
					{#each DAYS as day (day)}
						{@const course = getCourseAt(day, slot.index)}
						{@const blockInfo = course ? getBlockInfo(course, day, slot.index) : null}
						<td
							class="relative border-b border-separator p-0"
							class:bg-surface={slot.index % 2 === 0}
							class:bg-surface-secondary={slot.index % 2 === 1}
							onmouseenter={(e) => handleCellHover(e, day, slot.index)}
							onmouseleave={handleCellLeave}
						>
							{#if course && blockInfo && blockInfo.isFirst}
								<div
									class="absolute inset-0.5 flex cursor-pointer flex-col items-center justify-center gap-0.5 rounded-lg p-1 transition-all hover:brightness-90 hover:shadow-md"
									style="background-color: {course.color}; color: {getTextColor(
										course.color
									)}; height: calc({blockInfo.end - blockInfo.start} * 100% - 4px); z-index: 5;"
									role="button"
									tabindex="0"
									onclick={() => handleEdit(day, slot.index)}
									onkeydown={(e) => {
										if (e.key === 'Enter' || e.key === ' ') handleEdit(day, slot.index);
									}}
								>
									<span class="text-center text-[11px] leading-tight font-semibold"
										>{course.name}</span
									>
									{#if course.section}
										<span class="text-[10px] leading-tight opacity-80">Sec. {course.section}</span>
									{/if}
								</div>
							{:else if !blockInfo}
								<div class="flex h-full min-h-[40px] items-center justify-center"></div>
							{/if}
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>

{#if hoveredCourse}
	<div
		class="pointer-events-none fixed z-50 max-w-xs rounded-xl border border-separator bg-overlay p-3 shadow-overlay"
		style="left: {tooltipPos.x}px; top: {tooltipPos.y - 10}px; transform: translate(-50%, -100%);"
	>
		<div class="mb-1 flex items-center gap-2">
			<div class="h-3 w-3 rounded-full" style="background-color: {hoveredCourse.color};"></div>
			<span class="text-sm font-semibold text-foreground">{hoveredCourse.name}</span>
		</div>
		<div class="flex flex-col gap-0.5 text-xs text-muted">
			<span>Creditos: {hoveredCourse.credits}</span>
			{#if hoveredCourse.section}
				<span>Seccion: {hoveredCourse.section}</span>
			{/if}
			{#if hoveredCourse.cycle}
				<span>Ciclo: {hoveredCourse.cycle}</span>
			{/if}
			{#if hoveredDay && hoveredSlot !== null}
				{@const bi = getBlockInfo(hoveredCourse, hoveredDay, hoveredSlot)}
				{#if bi}
					<span class="mt-1 font-medium text-foreground">
						{DAY_LABELS[hoveredDay]}: {timeSlots[bi.start]?.label} - {timeSlots[bi.end - 1]?.label}
					</span>
				{/if}
			{/if}
		</div>
		<div class="mt-2 flex gap-1">
			<a
				href="/cursos/{hoveredCourse.id}"
				class="button button--sm button--secondary pointer-events-auto flex items-center gap-1"
				onclick={() => {
					hoveredCourse = null;
				}}
			>
				<Pencil size={12} />
				Editar
			</a>
			<button
				class="button button--sm button--danger pointer-events-auto flex items-center gap-1"
				onclick={() => {
					if (hoveredCourse) {
						onDelete(hoveredCourse.id);
						hoveredCourse = null;
					}
				}}
			>
				<Trash2 size={12} />
				Eliminar
			</button>
		</div>
	</div>
{/if}
