<script lang="ts">
	import { onMount } from 'svelte';
	import { scheduleStore } from '$lib/stores/schedule.svelte';
	import CourseList from '$lib/components/CourseList.svelte';
	import Plus from '@lucide/svelte/icons/plus';
	import Trash2 from '@lucide/svelte/icons/trash-2';

	let showConfirmClear = $state(false);

	onMount(() => {
		scheduleStore.init();
	});

	function handleDelete(id: string) {
		scheduleStore.deleteCourse(id);
	}

	function handleClearAll() {
		if (showConfirmClear) {
			scheduleStore.clearAll();
			showConfirmClear = false;
		} else {
			showConfirmClear = true;
			setTimeout(() => (showConfirmClear = false), 3000);
		}
	}
</script>

<div class="flex items-center justify-between">
	<div>
		<h2 class="text-xl font-bold text-foreground">Mis Cursos</h2>
		<p class="text-sm text-muted">
			{scheduleStore.courses.length} cursos · {scheduleStore.totalCredits} creditos totales
		</p>
	</div>
	<div class="flex gap-2">
		<a href="/cursos/nuevo" class="button button--primary flex items-center gap-1.5">
			<Plus size={16} />
			Nuevo Curso
		</a>
		<button
			class="button {showConfirmClear
				? 'button--danger'
				: 'button--ghost'} flex items-center gap-1.5"
			onclick={handleClearAll}
		>
			<Trash2 size={16} />
			{showConfirmClear ? 'Confirmar Borrar' : 'Limpiar Todo'}
		</button>
	</div>
</div>

<div class="mt-6">
	<CourseList courses={scheduleStore.courses} onDelete={handleDelete} />
</div>
