/**
 * @fileoverview Data Loader for Donation Dashboard
 *
 * This module provides functionality to load and process donation data from a TSV file.
 * It enriches the raw data with cumulative sums, projections, and other derived metrics
 * to support the visualization of donation trends and year-end forecasts.
 *
 * Features:
 * - Parses donation data from a TSV file.
 * - Enriches data with cumulative sums for donations and needs.
 * - Calculates year-end projections based on recent trends.
 * - Supports flexible data structures for use in D3.js visualizations.
 *
 * Exports:
 * - `ProcessedEntry`: Interface defining the structure of enriched donation data.
 * - `loadData`: Function to load and process the donation data.
 */

import * as d3 from 'd3'
import { monthLabels } from './utils'

/**
 * Interface for processed donation data entries.
 *
 * Each entry represents a single month of donation data, enriched with
 * cumulative sums and projections for visualization purposes.
 */
export interface ProcessedEntry {
	label: string // Short month label (e.g., "Jan", "Feb").
	column: number // Column index for chronological sorting.
	donors: number // Number of donors for the month.
	donated: number // Total amount donated (pledged + received).
	pledged: number // Amount pledged but not yet received.
	received: number // Amount received as donations.
	needed: number // Total amount needed for the month.
	hasDonation: boolean // Flag indicating if any donations were received.
	sumDonated: number // Cumulative sum of donations up to this month.
	sumNeeded: number // Cumulative sum of needs up to this month.
	sumProjectedDonations?: number // Projected cumulative donations (optional).
}

/**
 * Load and process donation data from a TSV file.
 *
 * This function performs the following steps:
 * 1. Parses the TSV file into raw data rows.
 * 2. Enriches each row with derived metrics, including:
 *    - Cumulative sums for donations and needs.
 *    - Year-end projections based on recent donation trends.
 * 3. Sorts the data chronologically by column index.
 *
 * @param file Relative path to the `.tsv` file.
 * @returns A promise resolving to an array of processed donation entries.
 *
 * Example Usage:
 * ```typescript
 * const data = await loadData('donations.tsv')
 * console.log(data)
 * ```
 */
export async function loadData(file: string): Promise<ProcessedEntry[]> {
	let data: d3.DSVRowArray<string>
	try {
		// Load the TSV file using d3.tsv
		data = await d3.tsv(file)
	} catch (error) {
		// Log an error if the file cannot be parsed
		console.error(`Error parsing the file ${file}:`, error)
		return []
	}

	// Map and process each entry in the data
	const entries: ProcessedEntry[] = data.map((entry) => {
		const date = (entry.month as string).split('-') // Split the month into year and month
		const year = parseInt(date[0], 10)
		const month = parseInt(date[1], 10)

		// Convert month number (1‑12) to short label
		const label = monthLabels[month - 1] ?? `${month}`

		const column = (year - 2020) * 12 + month - 1 // Calculate column index
		const donors = parseInt(entry.donors as string, 10) // Parse donors as integer
		const needed = parseFloat(entry.needed as string) // Parse needed amount as float
		const pledged = parseFloat(entry.pledged as string) // Parse pledged amount as float
		const received = parseFloat(entry.received as string) // Parse received amount as float
		const donated = pledged + received // Total donated amount

		// Return a processed entry object
		return {
			label,
			column,
			donors,
			donated,
			needed,
			pledged,
			received,
			hasDonation: received > 0, // Flag if donation exists
			sumDonated: 0, // Placeholder, will be calculated later
			sumNeeded: 0, // Placeholder, will be calculated later
		}
	})

	// Sort entries by column index
	entries.sort((a, b) => a.column - b.column)

	// Add cumulative data to each entry
	let sumDonated = 0
	let sumNeeded = 0
	entries.forEach((entry) => {
		entry.sumDonated = sumDonated += entry.donated
		entry.sumNeeded = sumNeeded += entry.needed
	})

	// Calculate average donations based on the last 3 months
	const lastThreeMonths = entries.filter((e) => e.hasDonation).slice(-3) // Get the last 3 months of data
	const avgDonated =
		lastThreeMonths.reduce((acc, e) => acc + e.donated, 0) / lastThreeMonths.length
	const avgSumDonated =
		lastThreeMonths.reduce((acc, e) => acc + e.sumDonated, 0) / lastThreeMonths.length
	const avgColumn = lastThreeMonths.reduce((acc, e) => acc + e.column, 0) / lastThreeMonths.length

	// Month starting the projection
	const projectionStart = lastThreeMonths[0].column

	// Add projected data to each entry
	entries.forEach((entry) => {
		if (entry.column >= projectionStart) {
			entry.sumProjectedDonations = avgSumDonated + avgDonated * (entry.column - avgColumn) // Projected donations
		}
	})

	return entries // Return processed entries
}
