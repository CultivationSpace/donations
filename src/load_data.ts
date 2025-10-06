import * as d3 from 'd3'
import { monthLabels } from './utils'

/** Interface for processed donation data entries. */
export interface ProcessedEntry {
	label: string
	column: number
	donors: number
	donated: number
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
		const donated = parseFloat(entry.donated as string) // Parse donated amount as float
		const needed = parseFloat(entry.needed as string) // Parse needed amount as float

		// Return a processed entry object
		return {
			label,
			column,
			donors,
			donated,
			needed,
			hasDonation: donated > 0, // Flag if donation exists
			sumDonated: 0, // Placeholder, will be calculated later
			sumNeeded: 0, // Placeholder, will be calculated later
		}
	})

	// Sort entries by column index
	entries.sort((a, b) => a.column - b.column)

	// Calculate average donations based on the last 3 months
	const lastThreeMonths = entries.filter((e) => e.hasDonation).slice(-3) // Get the last 3 months of data
	const avgDonated =
		lastThreeMonths.reduce((acc, entry) => acc + entry.donated, 0) / lastThreeMonths.length
	// Month starting the projection
	const projectionStartEntry = lastThreeMonths[lastThreeMonths.length - 1]

	// Add cumulative and projected data to each entry
	let sumDonated = 0
	let sumNeeded = 0
	entries.forEach((entry) => {
		sumDonated += entry.donated ?? 0 // Cumulative donated amount
		sumNeeded += entry.needed ?? 0 // Cumulative needed amount
		entry.sumDonated = sumDonated
		entry.sumNeeded = sumNeeded

		if (entry.column >= projectionStartEntry.column) {
			entry.sumProjectedDonations =
				sumDonated + avgDonated * (entry.column - projectionStartEntry.column) // Projected donations
		}
	})

	return entries // Return processed entries
}
