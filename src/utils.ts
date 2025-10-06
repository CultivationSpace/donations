/** Primary alert color – used for “needed” amounts. */
export const colorRed = '#AD4848'
/** Primary positive color – used for “donated” amounts. */
export const colorGreen = '#48AD9C'
export const colorDarkGreen = '#2A7B6D'

/** Month abbreviations for fast numeric‑to‑label mapping. */
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

/**
 * Format a number as Euro currency with thousands separators and a
 * trailing " €". A minimalist helper to avoid bringing in `Intl` for
 * this demo.
 *
 * @param value The number to format.
 * @returns The formatted currency string.
 */
export function formatCurrency(value: d3.NumberValue): string {
	return (
		value
			.valueOf()
			.toFixed(0)
			.replace(/\B(?=(\d{3})+(?!\d))/g, "'") + ' €'
	)
}
