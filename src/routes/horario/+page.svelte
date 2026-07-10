<script lang="ts">
	import { onMount } from 'svelte';
	import { scheduleStore } from '$lib/stores/schedule.svelte';
	import ScheduleGrid from '$lib/components/ScheduleGrid.svelte';
	import Select from '$lib/components/Select.svelte';
	import Plus from '@lucide/svelte/icons/plus';
	import Printer from '@lucide/svelte/icons/printer';
	import Calendar from '@lucide/svelte/icons/calendar';

	const sectionOptions = [
		{ value: '__all__', label: 'Todas las secciones' },
		...['A', 'B', 'C', 'D', 'E', 'F'].map((s) => ({ value: s, label: `Seccion ${s}` }))
	];

	let selectedSection = $state('__all__');

	onMount(() => {
		scheduleStore.init();
	});

	const filteredCourses = $derived(
		selectedSection === '__all__'
			? scheduleStore.courses
			: scheduleStore.courses.filter((c) => c.section === selectedSection)
	);

	const filteredCredits = $derived(filteredCourses.reduce((sum, c) => sum + c.credits, 0));

	function handleDelete(id: string) {
		scheduleStore.deleteCourse(id);
	}

	function handleExport() {
		const el = document.getElementById('schedule-grid');
		if (!el) return;
		const printWindow = window.open('', '_blank');
		if (!printWindow) return;

		printWindow.document.write(
			`
			<!DOCTYPE html>
			<html>
			<head>
				<title>Mi Horario</title>
				<style>
					body { font-family: system-ui, sans-serif; margin: 20px; }
					table { width: 100%; border-collapse: collapse; }
					th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: center; }
					th { background: #f3f4f6; font-weight: 600; }
				</style>
			</head>
			<body>
				<h1>Mi Horario - ${new Date().toLocaleDateString('es-PE')}</h1>
				${el.outerHTML}
				<script>window.onload = () => window.print();</scr` +
				`ipt>
			</body>
			</html>
		`
		);
		printWindow.document.close();
	}
</script>

<div class="flex items-center justify-between">
	<div>
		<h2 class="text-xl font-bold text-foreground">Horario Semanal</h2>
		<p class="text-sm text-muted">
			{filteredCourses.length} cursos · {filteredCredits} creditos
		</p>
	</div>
	<div class="flex items-center gap-2">
		<div class="w-[200px]">
			<Select bind:value={selectedSection} options={sectionOptions} placeholder="Seccion" />
		</div>
		<a href="/cursos/nuevo" class="button button--primary flex items-center gap-1.5">
			<Plus size={16} />
			Nuevo Curso
		</a>
		<button
			class="button button--secondary button--sm flex items-center gap-1.5"
			onclick={handleExport}
		>
			<Printer size={16} />
			Exportar
		</button>
	</div>
</div>

{#if scheduleStore.courses.length === 0}
	<div class="card card--secondary mt-6 flex flex-col items-center gap-4 py-12 text-center">
		<Calendar size={48} class="text-muted opacity-30" />
		<div>
			<h3 class="text-lg font-medium text-foreground">Sin cursos</h3>
			<p class="mt-1 text-sm text-muted">
				Agrega tu primer curso para comenzar a organizar tu horario
			</p>
		</div>
		<a href="/cursos/nuevo" class="button button--primary flex items-center gap-1.5">
			<Plus size={16} />
			Agregar Curso
		</a>
	</div>
{:else if filteredCourses.length === 0}
	<div class="card card--secondary mt-6 flex flex-col items-center gap-4 py-12 text-center">
		<Calendar size={48} class="text-muted opacity-30" />
		<div>
			<h3 class="text-lg font-medium text-foreground">Sin cursos para esta seccion</h3>
			<p class="mt-1 text-sm text-muted">No hay cursos asignados a la seccion seleccionada</p>
		</div>
	</div>
{:else}
	<div class="card card--default mt-6 overflow-hidden p-0">
		<ScheduleGrid courses={filteredCourses} onDelete={handleDelete} />
	</div>
{/if}
