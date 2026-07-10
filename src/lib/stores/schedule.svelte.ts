import type { Course, Day } from '$lib/types';
import { generateId } from '$lib/types';
import { PersistedState } from 'runed';

const STORAGE_KEY = 'schedule-data';

interface ScheduleData {
	courses: Course[];
}

const persisted = new PersistedState<ScheduleData>(
	STORAGE_KEY,
	{ courses: [] },
	{ syncTabs: true }
);

export const scheduleStore = {
	get courses() {
		return persisted.current.courses;
	},

	init() {
		// PersistedState auto-loads from localStorage
	},

	addCourse(course: Omit<Course, 'id'>) {
		const newCourse: Course = { ...course, id: generateId() };
		persisted.current = { courses: [...persisted.current.courses, newCourse] };
	},

	updateCourse(updated: Course) {
		persisted.current = {
			courses: persisted.current.courses.map((c) => (c.id === updated.id ? updated : c))
		};
	},

	deleteCourse(id: string) {
		persisted.current = {
			courses: persisted.current.courses.filter((c) => c.id !== id)
		};
	},

	clearAll() {
		persisted.current = { courses: [] };
	},

	getCourseById(id: string): Course | undefined {
		return persisted.current.courses.find((c) => c.id === id);
	},

	checkConflict(
		day: Day,
		startSlot: number,
		endSlot: number,
		section: string,
		excludeId?: string
	): Course | null {
		for (const course of persisted.current.courses) {
			if (excludeId && course.id === excludeId) continue;
			if (course.section !== section) continue;
			for (const block of course.blocks) {
				if (block.day === day) {
					const overlap = startSlot < block.endSlot && endSlot > block.startSlot;
					if (overlap) return course;
				}
			}
		}
		return null;
	},

	get totalCredits() {
		return persisted.current.courses.reduce((sum, c) => sum + c.credits, 0);
	}
};
