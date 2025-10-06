/**
 * @fileoverview Donation Dashboard renderer.
 *
 * Loads donation data from a TSV file and renders two interactive
 * D3.js charts:
 *  • Column chart – compares monthly donations (green) with
 *    monthly needs (red).
 *  • Projection chart – shows cumulative totals, projected year‑end
 *    donations, and highlights any funding shortfall.
 *
 * Runs directly in the browser via `<script type="module">`; no build
 * tooling required.
 */

import * as d3 from 'd3'

/** Primary alert color – used for “needed” amounts. */
export const colorRed = '#AD4848'
/** Primary positive color – used for “donated” amounts. */
export const colorGreen = '#48AD9C'

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

/** Interface for processed donation data entries. */
interface ProcessedEntry {
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
 * Entry point – asynchronous IIFE (Immediately Invoked Function
 * Expression) so we can use `await` at the top level in plain
 * browsers. It loads the TSV data and renders both charts.
 */
; (async () => {
	const data = await loadData('donations.tsv') // Load data from a TSV file
	drawColumnChart('#column_chart', data) // Draw the column chart
	drawProjectionChart('#projection_chart', data) // Draw the projection chart
})()

/**
 * Load donation data from a TSV file and enrich each row with
 * cumulative sums and simple year‑end projections.
 *
 * @param file Relative path to the `.tsv` file.
 * @returns A promise resolving to an array of processed entries.
 */
async function loadData(file: string): Promise<ProcessedEntry[]> {
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

/**
 * Render a grouped column chart comparing monthly donations
 * (green) against monthly needs (red).
 *
 * @param query CSS selector of the container element.
 * @param data Enriched dataset returned by `loadData()`.
 */
function drawColumnChart(query: string, data: ProcessedEntry[]): void {
	const margin = { left: 60, right: 10, top: 20, bottom: 30 } // Chart margins

	// Get container dimensions
	const container = document.querySelector(query) as HTMLElement
	const width = container.clientWidth
	const height = container.clientHeight

	// Define chart boundaries
	const x0 = margin.left
	const x1 = width - margin.right
	const y0 = height - margin.bottom
	const y1 = margin.top

	// Create an SVG element
	const svg = d3
		.create('svg')
		.attr('width', width)
		.attr('height', height)
		.attr('viewBox', [0, 0, width, height])
		.style('font-family', 'sans-serif')
		.style('font-size', '10px')

	// Define x-axis scale and axis
	const x = d3
		.scaleBand()
		.domain(data.map((d) => d.label)) // Use labels as domain
		.range([x0, x1]) // Map to chart width

	const xAxis = d3.axisBottom(x).tickSize(0) // Create x-axis

	// Add x-axis to the chart
	svg.append('g')
		.style('font-size', '14px')
		.attr('transform', `translate(0,${y0})`)
		.call(xAxis)
		.selectAll('text')
		.attr('transform', 'translate(0,5)')

	const maxY = d3.max(data, (d) => Math.max(d.donated, d.needed)) ?? 0
	const y = d3
		.scaleLinear()
		.domain([0, maxY * 1.1]) // Dynamic range based on data (+10% headroom)
		.range([y0, y1])

	const yAxis = d3
		.axisLeft(y)
		.tickFormat(formatCurrency)
		.ticks(5)

	// Add y-axis to the chart
	svg.append('g').style('font-size', '14px').attr('transform', `translate(${x0},0)`).call(yAxis)

	const b = x.bandwidth() // Get bandwidth for bars

	// Add bars for "needed" values
	svg.selectAll('needed')
		.data(data)
		.enter()
		.append('rect')
		.attr('x', (d) => (x(d.label) ?? 0) + b * 0.25)
		.attr('y', (d) => y(d.needed))
		.attr('width', b * 0.6)
		.attr('height', (d) => y(0) - y(d.needed))
		.attr('fill', colorRed)

	// Add bars for "donated" values
	svg.selectAll('donated')
		.data(data)
		.enter()
		.append('rect')
		.attr('x', (d) => (x(d.label) ?? 0) + b * 0.15)
		.attr('y', (d) => y(d.donated))
		.attr('width', b * 0.6)
		.attr('height', (d) => y(0) - y(d.donated))
		.attr('fill', colorGreen)

	// Append the SVG to the container
	container.append(svg.node()!)
}

/**
 * Render a line chart with three series:
 *   1. Cumulative needs (red solid)
 *   2. Cumulative donations (green solid)
 *   3. Projected cumulative donations (green dashed)
 *
 * If the projection falls short, the chart draws an annotation box
 * indicating the shortfall amount.
 *
 * @param {string}           query  CSS selector of the container element.
 * @param {ProcessedEntry[]} data   Enriched dataset returned by loadData().
 */
function drawProjectionChart(query: string, data: ProcessedEntry[]): void {
	const margin = { left: 70, right: 10, top: 20, bottom: 30 } // Chart margins

	// Get container dimensions
	const container = document.querySelector(query) as HTMLElement
	const width = container.clientWidth
	const height = container.clientHeight

	// Define chart boundaries
	const x0 = margin.left
	const x1 = width - margin.right
	const y0 = height - margin.bottom
	const y1 = margin.top

	// Create an SVG element
	const svg = d3
		.create('svg')
		.attr('width', width)
		.attr('height', height)
		.attr('viewBox', [0, 0, width, height])
		.style('font-family', 'sans-serif')
		.style('font-size', '10px')

	// Define x-axis scale and axis
	const x = d3
		.scaleBand()
		.domain(data.map((d) => d.label)) // Use labels as domain
		.range([x0, x1]) // Map to chart width

	const xAxis = d3.axisBottom(x).tickSize(0) // Create x-axis

	// Add x-axis to the chart
	svg.append('g')
		.style('font-size', '14px')
		.attr('transform', `translate(0,${y0})`)
		.call(xAxis)
		.selectAll('text')
		.attr('transform', 'translate(0,5)')

	const maxY = d3.max(data, (d) => Math.max(d.sumNeeded, d.sumProjectedDonations ?? 0)) ?? 0
	const y = d3
		.scaleLinear()
		.domain([0, maxY * 1.1]) // Dynamic range (+10% headroom)
		.range([y0, y1])

	const yAxis = d3
		.axisLeft(y)
		.tickFormat(formatCurrency)
		.ticks(5)

	// Add y-axis to the chart
	svg.append('g').style('font-size', '14px').attr('transform', `translate(${x0},0)`).call(yAxis)

	const b = x.bandwidth() // Get bandwidth for bars

	// Add line for "needed" values
	svg.append('path')
		.datum(data)
		.attr('fill', 'none')
		.attr('stroke', colorRed)
		.attr('stroke-width', 3)
		.attr(
			'd',
			d3
				.line<ProcessedEntry>()
				.x((d) => (x(d.label) ?? 0) + b * 0.5)
				.y((d) => y(d.sumNeeded))
		)

	// Add dashed line for "projected donations"
	svg.append('path')
		.datum(data.filter((d) => d.sumProjectedDonations))
		.attr('fill', 'none')
		.attr('stroke', colorGreen)
		.attr('stroke-width', 3)
		.attr('stroke-dasharray', '3,6')
		.attr(
			'd',
			d3
				.line<ProcessedEntry>()
				.x((d) => (x(d.label) ?? 0) + b * 0.5)
				.y((d) => y(d.sumProjectedDonations!))
		)

	// Add line for "actual donations"
	svg.append('path')
		.datum(data.filter((d) => d.hasDonation))
		.attr('fill', 'none')
		.attr('stroke', colorGreen)
		.attr('stroke-width', 3)
		.attr(
			'd',
			d3
				.line<ProcessedEntry>()
				.x((d) => (x(d.label) ?? 0) + b * 0.5)
				.y((d) => y(d.sumDonated))
		)

	// Calculate the difference between projected and needed donations
	const sumProjectedDonations = data[data.length - 1].sumProjectedDonations!
	const sumNeeded = data[data.length - 1]!.sumNeeded
	const difference = sumProjectedDonations - sumNeeded

	// If there is a shortfall, draw an annotation
	if (difference < 0) {
		const yp = y(sumProjectedDonations)
		const yn = y(sumNeeded)
		const xa = x1 - b * 0.3
		const xm = xa + 5

		const path = d3.line()([
			[xa, yn],
			[xm, yn],
			[xm, yp],
			[xa, yp],
		])

		svg.append('path')
			.attr('d', path)
			.attr('fill', 'none')
			.attr('stroke', '#000')
			.attr('stroke-width', 1.5)

		// Add text annotation for the shortfall
		svg.append('text')
			.attr('x', xm)
			.attr('y', (yp + yn) / 2)
			.attr('dy', '1em')
			.attr('dx', '-0.2em')
			.attr('text-anchor', 'end')
			.text(formatCurrency(difference))
			.attr('font-weight', 'bold')
			.attr('font-size', '2em')
			.attr('fill', colorRed)
	}

	// Append the SVG to the container
	container.append(svg.node()!)
}

/**
 * Format a number as Euro currency with thousands separators and a
 * trailing " €". A minimalist helper to avoid bringing in `Intl` for
 * this demo.
 *
 * @param value The number to format.
 * @returns The formatted currency string.
 */
function formatCurrency(value: d3.NumberValue): string {
	return value.valueOf().toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, "'") + ' €'
}
