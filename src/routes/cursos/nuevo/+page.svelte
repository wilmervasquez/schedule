<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { scheduleStore } from '$lib/stores/schedule.svelte';
	import CourseForm from '$lib/components/CourseForm.svelte';
	import type { Course } from '$lib/types';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';

	onMount(() => {
		scheduleStore.init();
	});

	function handleSave(course: Omit<Course, 'id'> & { id?: string }) {
		scheduleStore.addCourse(course);
		goto('/cursos');
	}

	function handleCancel() {
		goto('/cursos');
	}
</script>

<div class="mx-auto max-w-2xl">
	<div class="mb-6">
		<a href="/cursos" class="flex items-center gap-1 text-sm text-muted hover:text-foreground">
			<ArrowLeft size={14} />
			Volver a Cursos
		</a>
	</div>

	<CourseForm
		onSave={handleSave}
		onCancel={handleCancel}
		checkConflict={scheduleStore.checkConflict}
	/>
</div>
