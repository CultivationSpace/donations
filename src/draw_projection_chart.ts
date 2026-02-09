import * as d3 from 'd3'
import { ProcessedEntry } from './load_data'
import { colorDarkGreen, colorGreen, colorRed, formatCurrency } from './utils'

/**
 * Render a cumulative line chart with three series: needs (red), actual donations (green),
 * and projected donations (dashed green). Annotates year-end shortfall if projected < needed.
 */
export function drawProjectionChart(query: string, data: ProcessedEntry[]): void {
	const margin = { left: 70, right: 10, top: 20, bottom: 30 }

	const container = document.querySelector(query) as HTMLElement | null
	if (!container) return
	const width = container.clientWidth
	const height = container.clientHeight

	const x0 = margin.left
	const x1 = width - margin.right
	const y0 = height - margin.bottom
	const y1 = margin.top

	const svg = d3
		.create('svg')
		.attr('width', width)
		.attr('height', height)
		.attr('viewBox', [0, 0, width, height])
		.style('font-family', 'sans-serif')
		.style('font-size', '10px')

	const x = d3
		.scaleBand()
		.domain(data.map((d) => d.label))
		.range([x0, x1])

	svg.append('g')
		.style('font-size', '14px')
		.attr('transform', `translate(0,${y0})`)
		.call(d3.axisBottom(x).tickSize(0))
		.selectAll('text')
		.attr('transform', 'translate(0,5)')

	const maxY = d3.max(data, (d) => Math.max(d.sumNeeded, d.sumProjectedDonations ?? 0)) ?? 0
	const y = d3
		.scaleLinear()
		.domain([0, maxY * 1.1])
		.range([y0, y1])

	svg.append('g')
		.style('font-size', '14px')
		.attr('transform', `translate(${x0},0)`)
		.call(d3.axisLeft(y).tickFormat(formatCurrency).ticks(5))

	const b = x.bandwidth()

	// Cumulative needs (red)
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

	// Cumulative actual donations (green)
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

	// Projected donations (dashed green)
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

	// Shortfall annotation
	const lastEntry = data[data.length - 1]
	const sumProjectedDonations = lastEntry?.sumProjectedDonations
	const sumNeeded = lastEntry?.sumNeeded

	if (sumProjectedDonations != null && sumNeeded != null && sumProjectedDonations - sumNeeded < 0) {
		const difference = sumProjectedDonations - sumNeeded
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

	container.append(svg.node()!)
}
