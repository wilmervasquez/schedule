<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { scheduleStore } from '$lib/stores/schedule.svelte';
	import CourseForm from '$lib/components/CourseForm.svelte';
	import type { Course } from '$lib/types';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Trash2 from '@lucide/svelte/icons/trash-2';

	let course = $state<Course | undefined>(undefined);
	let loading = $state(true);

	onMount(() => {
		scheduleStore.init();
		const id = $page.params.id ?? '';
		course = scheduleStore.getCourseById(id);
		loading = false;

		if (!course) {
			goto('/cursos');
		}
	});

	function handleSave(updated: Omit<Course, 'id'> & { id?: string }) {
		if (updated.id) {
			scheduleStore.updateCourse(updated as Course);
		}
		goto('/cursos');
	}

	function handleCancel() {
		goto('/cursos');
	}

	function handleDelete() {
		if (course) {
			scheduleStore.deleteCourse(course.id);
			goto('/cursos');
		}
	}
</script>

<div class="mx-auto max-w-2xl">
	<div class="mb-6">
		<a href="/cursos" class="flex items-center gap-1 text-sm text-muted hover:text-foreground">
			<ArrowLeft size={14} />
			Volver a Cursos
		</a>
	</div>

	{#if loading}
		<div class="card card--secondary flex items-center justify-center py-12">
			<p class="text-muted">Cargando...</p>
		</div>
	{:else if course}
		<div class="mb-4 flex items-center justify-between">
			<h2 class="text-xl font-bold text-foreground">Editar: {course.name}</h2>
			<button
				class="button button--danger button--sm flex items-center gap-1.5"
				onclick={handleDelete}
			>
				<Trash2 size={14} />
				Eliminar Curso
			</button>
		</div>

		<CourseForm
			{course}
			onSave={handleSave}
			onCancel={handleCancel}
			checkConflict={scheduleStore.checkConflict}
		/>
	{/if}
</div>
