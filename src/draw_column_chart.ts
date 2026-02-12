import * as d3 from 'd3';
import { ProcessedEntry } from './load_data';
import { indexToLabel, colorGreen, colorRed, formatCurrency } from './utils';

/**
 * Render a grouped column chart comparing monthly donations (green)
 * against monthly needs (red). Pledged amounts are shown as striped green bars.
 */
export function drawColumnChart(query: string, data: ProcessedEntry[]): void {
	const margin = { left: 50, right: 5, top: 5, bottom: 20 };

	const container = document.querySelector(query) as HTMLElement | null;
	if (!container) return;
	container.innerHTML = ''; // Clear previous chart if any

	const width = container.clientWidth;
	const height = container.clientHeight;

	const x0 = margin.left;
	const x1 = width - margin.right;
	const y0 = height - margin.bottom;
	const y1 = margin.top;

	const svg = d3
		.create('svg')
		.attr('viewBox', [0, 0, width, height])
		.style('font-family', 'sans-serif')
		.style('font-size', '10px');

	const stripWidth = Math.max(2, Math.min(5, Math.round(width / 200)));
	// Diagonal stripe pattern for pledged amounts
	svg.append('pattern')
		.attr('id', 'pattern_pledged')
		.attr('patternUnits', 'userSpaceOnUse')
		.attr('width', stripWidth)
		.attr('height', stripWidth)
		.attr('patternTransform', 'rotate(45)')
		.append('rect')
		.attr('height', 30)
		.attr('width', stripWidth / 2)
		.attr('fill', colorGreen);

	const x = d3.scaleBand(
		data.map((d) => d.index),
		[x0, x1]
	);

	svg.append('g')
		.attr('transform', `translate(0,${y0})`)
		.call(d3.axisBottom(x).tickSize(0).tickFormat(indexToLabel))
		.selectAll('text')
		.attr('transform', 'translate(0,5)');

	const maxY = d3.max(data, (d) => Math.max(d.donated, d.needed)) ?? 0;
	const y = d3
		.scaleLinear()
		.domain([0, maxY * 1.1])
		.range([y0, y1]);

	svg.append('g')
		.attr('transform', `translate(${x0},0)`)
		.call(d3.axisLeft(y).tickFormat(formatCurrency).ticks(5));

	const b = x.bandwidth();

	// Needed (red, behind)
	svg.selectAll('needed')
		.data(data)
		.enter()
		.append('rect')
		.attr('x', (d) => (x(d.index) ?? 0) + b * 0.25)
		.attr('y', (d) => y(d.needed))
		.attr('width', b * 0.6)
		.attr('height', (d) => y(0) - y(d.needed))
		.attr('fill', colorRed)
		.attr('stroke', colorRed)
		.attr('stroke-width', 1);

	// Received (solid green)
	svg.selectAll('received')
		.data(data)
		.enter()
		.append('rect')
		.attr('x', (d) => (x(d.index) ?? 0) + b * 0.15)
		.attr('y', (d) => y(d.received))
		.attr('width', b * 0.6)
		.attr('height', (d) => y(0) - y(d.received))
		.attr('fill', colorGreen)
		.attr('stroke', colorGreen)
		.attr('stroke-width', 1);

	// Pledged (striped green, stacked on top of received)
	svg.selectAll('pledged')
		.data(data)
		.enter()
		.append('rect')
		.attr('x', (d) => (x(d.index) ?? 0) + b * 0.15)
		.attr('y', (d) => y(d.pledged + d.received))
		.attr('width', b * 0.6)
		.attr('height', (d) => y(0) - y(d.pledged))
		.attr('fill', 'url(#pattern_pledged)')
		.attr('stroke', colorGreen)
		.attr('stroke-width', 1);

	container.append(svg.node()!);
}
