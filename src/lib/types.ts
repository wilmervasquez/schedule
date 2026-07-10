export interface Course {
	id: string;
	name: string;
	credits: number;
	color: string;
	section: string;
	cycle: string;
	blocks: ScheduleBlock[];
}

export interface ScheduleBlock {
	day: Day;
	startSlot: number;
	endSlot: number;
}

export type Day =
	'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export const DAYS: Day[] = [
	'monday',
	'tuesday',
	'wednesday',
	'thursday',
	'friday',
	'saturday',
	'sunday'
];

export const DAY_LABELS: Record<Day, string> = {
	monday: 'Lunes',
	tuesday: 'Martes',
	wednesday: 'Miércoles',
	thursday: 'Jueves',
	friday: 'Viernes',
	saturday: 'Sábado',
	sunday: 'Domingo'
};

export interface TimeSlot {
	index: number;
	label: string;
	hour: number;
	minute: number;
}

export const START_HOUR = 6;
export const START_MINUTE = 30;
export const BLOCK_DURATION = 45;
export const END_HOUR = 22;
export const END_MINUTE = 15;

export function generateTimeSlots(): TimeSlot[] {
	const slots: TimeSlot[] = [];
	let currentMinutes = START_HOUR * 60 + START_MINUTE;
	const endMinutes = END_HOUR * 60 + END_MINUTE;
	let index = 0;

	while (currentMinutes < endMinutes) {
		const hour = Math.floor(currentMinutes / 60);
		const minute = currentMinutes % 60;
		const period = hour >= 12 ? 'pm' : 'am';
		const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
		const label = `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
		slots.push({ index, label, hour, minute });
		currentMinutes += BLOCK_DURATION;
		index++;
	}

	return slots;
}

export function slotToTime(slot: number): string {
	const totalMinutes = START_HOUR * 60 + START_MINUTE + slot * BLOCK_DURATION;
	const hour = Math.floor(totalMinutes / 60);
	const minute = totalMinutes % 60;
	const period = hour >= 12 ? 'pm' : 'am';
	const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
	return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
}

export function slotRangeLabel(startSlot: number, endSlot: number): string {
	return `${slotToTime(startSlot)} - ${slotToTime(endSlot)}`;
}

export function timeToSlot(hour: number, minute: number): number {
	const totalMinutes = hour * 60 + minute;
	const startMinutes = START_HOUR * 60 + START_MINUTE;
	return Math.floor((totalMinutes - startMinutes) / BLOCK_DURATION);
}

export function generateId(): string {
	return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}
