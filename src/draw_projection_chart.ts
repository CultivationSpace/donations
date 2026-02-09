import * as d3 from 'd3'
import { ProcessedEntry } from './load_data'
import { colorDarkGreen, colorGreen, colorRed, formatCurrency } from './utils'

/**
 * @fileoverview Projection Chart Renderer
 *
 * This module provides functionality to render a line chart that visualizes
 * cumulative donation trends and projections against cumulative needs.
 * The chart is rendered using D3.js and includes the following features:
 *
 * - **Red Solid Line**: Represents cumulative "needed" amounts.
 * - **Green Solid Line**: Represents cumulative "donated" amounts (received donations).
 * - **Green Dashed Line**: Represents projected cumulative donations based on recent trends.
 * - **Shortfall Annotation**: Highlights any funding shortfall with a labeled annotation box.
 * - **Dynamic Scaling**: Automatically adjusts the y-axis range based on the data.
 * - **Interactive Labels**: Includes x-axis labels for months and y-axis labels for amounts.
 *
 * This chart is designed to provide a clear visual representation of donation trends,
 * projections, and any potential funding gaps.
 *
 * Exports:
 * - `drawProjectionChart`: Function to render the projection chart.
 */

/**
 * Render a line chart with three series:
 *   1. **Cumulative Needs (red solid)**: Total cumulative "needed" amounts.
 *   2. **Cumulative Donations (green solid)**: Total cumulative "donated" amounts (received donations).
 *   3. **Projected Donations (green dashed)**: Projected cumulative donations based on recent trends.
 *
 * If the projected donations fall short of the cumulative needs, the chart
 * draws an annotation box indicating the shortfall amount.
 *
 * @param query CSS selector of the container element where the chart will be rendered.
 * @param data Enriched dataset returned by `loadData()`, containing processed donation data.
 *
 * Example Usage:
 * ```typescript
 * drawProjectionChart('#projection_chart', data)
 * ```
 */
export function drawProjectionChart(query: string, data: ProcessedEntry[]): void {
	const margin = { left: 70, right: 10, top: 20, bottom: 30 } // Chart margins

	const container = document.querySelector(query) as HTMLElement | null
	if (!container) return
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

	// Define y-axis scale and axis
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

	// Add dashed line for "projected donations"
	svg.append('path')
		.datum(data.filter((d) => d.sumProjectedDonations))
		.attr('fill', 'none')
		.attr('stroke', colorDarkGreen)
		.attr('stroke-width', 2)
		.attr('stroke-dasharray', '2,3')
		.attr(
			'd',
			d3
				.line<ProcessedEntry>()
				.x((d) => (x(d.label) ?? 0) + b * 0.5)
				.y((d) => y(d.sumProjectedDonations!))
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
