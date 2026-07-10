<script lang="ts">
	import type { Course } from '$lib/types';
	import { DAY_LABELS, slotRangeLabel } from '$lib/types';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import BookOpen from '@lucide/svelte/icons/book-open';
	import Plus from '@lucide/svelte/icons/plus';

	interface Props {
		courses: Course[];
		onDelete: (id: string) => void;
	}

	let { courses, onDelete }: Props = $props();
</script>

{#if courses.length > 0}
	<div class="card card--default">
		<div class="card__header">
			<h2 class="card__title">Cursos Matriculados ({courses.length})</h2>
		</div>
		<div class="card__content gap-2">
			{#each courses as course (course.id)}
				<div
					class="flex items-center justify-between gap-3 rounded-lg border border-separator bg-surface-secondary p-3 transition-colors hover:bg-surface-tertiary"
				>
					<div class="flex items-center gap-3">
						<div
							class="h-4 w-4 shrink-0 rounded-full"
							style="background-color: {course.color};"
						></div>
						<div>
							<div class="text-sm font-medium text-foreground">{course.name}</div>
							<div class="text-xs text-muted">
								{course.credits} creditos
								{#if course.section}
									· Sec. {course.section}
								{/if}
								{#if course.cycle}
									· {course.cycle}
								{/if}
							</div>
							<div class="mt-1 flex flex-wrap gap-1">
								{#each course.blocks as block (block.day + block.startSlot)}
									<span
										class="inline-block rounded-md bg-surface-tertiary px-2 py-0.5 text-[10px] text-muted"
									>
										{DAY_LABELS[block.day]}
										{slotRangeLabel(block.startSlot, block.endSlot)}
									</span>
								{/each}
							</div>
						</div>
					</div>
					<div class="flex shrink-0 gap-1">
						<a
							href="/cursos/{course.id}"
							class="button button--sm button--secondary flex items-center gap-1"
						>
							<Pencil size={12} />
							Editar
						</a>
						<button
							class="button button--sm button--danger flex items-center gap-1"
							onclick={() => onDelete(course.id)}
						>
							<Trash2 size={12} />
							Eliminar
						</button>
					</div>
				</div>
			{/each}
		</div>
	</div>
{:else}
	<div class="card card--secondary flex flex-col items-center gap-4 py-12 text-center">
		<BookOpen size={48} class="text-muted opacity-30" />
		<div>
			<h3 class="text-lg font-medium text-foreground">Sin cursos</h3>
			<p class="mt-1 text-sm text-muted">Agrega tu primer curso para comenzar</p>
		</div>
		<a href="/cursos/nuevo" class="button button--primary flex items-center gap-1.5">
			<Plus size={16} />
			Agregar Curso
		</a>
	</div>
{/if}
