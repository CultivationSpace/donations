import type { NumberValue } from 'd3'

export const colorRed = '#AD4848'
export const colorGreen = '#48AD9C'
export const colorDarkGreen = '#2A7B6D'

export const monthLabels: string[] = [
	'Jan',
	'Feb',
	'Mar',
	'Apr',
	'May',
	'Jun',
	'Jul',
	'Aug',
	'Sep',
	'Oct',
	'Nov',
	'Dec',
]

/** Format a number as Euro currency, e.g. 1234567 -> "1'234'567 €" */
export function formatCurrency(value: NumberValue): string {
	return (
		value
			.valueOf()
			.toFixed(0)
			.replace(/\B(?=(\d{3})+(?!\d))/g, "'") + ' €'
	)
}

export function indexToLabel(index: number): string {
	return monthLabels[(index + 11) % 12]
}
