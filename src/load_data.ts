import * as d3 from 'd3'
import { monthLabels } from './utils'

/** Processed donation data for a single month, enriched with cumulative sums and projections. */
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

/** Load a TSV file and return processed entries with cumulative sums and trend projections. */
export async function loadData(file: string): Promise<ProcessedEntry[]> {
	let data: d3.DSVRowArray<string>
	try {
		data = await d3.tsv(file)
	} catch (error) {
		console.error(`Error parsing the file ${file}:`, error)
		return []
	}

	const entries: ProcessedEntry[] = data.map((entry) => {
		const date = (entry.month as string).split('-')
		const year = parseInt(date[0], 10)
		const month = parseInt(date[1], 10)

		const label = `${monthLabels[month - 1] ?? month} '${String(year).slice(2)}`
		const column = (year - 2020) * 12 + month - 1
		const donors = parseInt(entry.donors as string, 10)
		const needed = parseFloat(entry.needed as string)
		const pledged = parseFloat(entry.pledged as string)
		const received = parseFloat(entry.received as string)
		const donated = pledged + received

		return {
			label,
			column,
			donors,
			donated,
			needed,
			pledged,
			received,
			hasDonation: received > 0,
			sumDonated: 0,
			sumNeeded: 0,
		}
	})

	entries.sort((a, b) => a.column - b.column)

	// Calculate cumulative sums
	let sumDonated = 0
	let sumNeeded = 0
	entries.forEach((entry) => {
		entry.sumDonated = sumDonated += entry.donated
		entry.sumNeeded = sumNeeded += entry.needed
	})

	// Project year-end donations based on the trend of the last 3 months with donations
	const lastThreeMonths = entries.filter((e) => e.hasDonation).slice(-3)
	const avgDonated =
		lastThreeMonths.reduce((acc, e) => acc + e.donated, 0) / lastThreeMonths.length
	const avgSumDonated =
		lastThreeMonths.reduce((acc, e) => acc + e.sumDonated, 0) / lastThreeMonths.length
	const avgColumn = lastThreeMonths.reduce((acc, e) => acc + e.column, 0) / lastThreeMonths.length

	const projectionStart = lastThreeMonths[0].column
	entries.forEach((entry) => {
		if (entry.column >= projectionStart) {
			entry.sumProjectedDonations = avgSumDonated + avgDonated * (entry.column - avgColumn)
		}
	})

	return entries
}
