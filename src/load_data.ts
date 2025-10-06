import * as d3 from 'd3'
import { monthLabels } from './utils'

/** Interface for processed donation data entries. */
export interface ProcessedEntry {
	label: string
	column: number
	donors: number
	donated: number
	pledged: number
	received: number
	needed: number
	hasDonation: boolean
	sumDonated: number
	sumNeeded: number
	sumProjectedDonations?: number
}

/**
 * Load donation data from a TSV file and enrich each row with
 * cumulative sums and simple year‑end projections.
 *
 * @param file Relative path to the `.tsv` file.
 * @returns A promise resolving to an array of processed entries.
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
		entry.sumDonated = (sumDonated += entry.donated)
		entry.sumNeeded = (sumNeeded += entry.needed)
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
