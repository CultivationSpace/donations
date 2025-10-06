import * as d3 from 'd3'
import { ProcessedEntry } from './load_data'
import { colorGreen, colorRed, formatCurrency } from './utils'

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
export function drawProjectionChart(query: string, data: ProcessedEntry[]): void {
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

	const yAxis = d3.axisLeft(y).tickFormat(formatCurrency).ticks(5)

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
