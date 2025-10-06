/**
 * @fileoverview Utility Functions and Constants
 *
 * This module provides utility functions and constants used across the Donation Dashboard.
 * It includes color definitions, month labels, and a helper function for formatting
 * currency values.
 *
 * Exports:
 * - `colorRed`: Primary alert color for "needed" amounts.
 * - `colorGreen`: Primary positive color for "donated" amounts.
 * - `colorDarkGreen`: Secondary positive color for projections or highlights.
 * - `monthLabels`: Array of abbreviated month names for quick numeric-to-label mapping.
 * - `formatCurrency`: Function to format numbers as Euro currency strings.
 */

/** Primary alert color – used for "needed" amounts. */
export const colorRed = '#AD4848'

/** Primary positive color – used for "donated/received" amounts. */
export const colorGreen = '#48AD9C'

/** Secondary positive color – used for projections. */
export const colorDarkGreen = '#2A7B6D'

/**
 * Month abbreviations for fast numeric-to-label mapping.
 * The array maps month numbers (1-12) to their respective short labels.
 */
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
 * Format a number as Euro currency with thousands separators and a trailing " €".
 * This minimalist helper avoids bringing in `Intl` for simplicity in this demo.
 *
 * Example:
 * - Input: 1234567
 * - Output: "1'234'567 €"
 *
 * @param value The number to format (can be a `number` or `d3.NumberValue`).
 * @returns The formatted currency string.
 */
export function formatCurrency(value: d3.NumberValue): string {
	return (
		value
			.valueOf() // Convert to a primitive number
			.toFixed(0) // Round to the nearest integer
			.replace(/\B(?=(\d{3})+(?!\d))/g, "'") + ' €' // Add thousands separators and append " €"
	)
}
