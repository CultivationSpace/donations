import { D3Node } from 'npm:d3-node';
import D3 from 'npm:@types/d3';
import { SVGElement } from 'npm:@types/jsdom'
import type { Entry } from './data.ts';
import { width, height, colorRed, colorGreen } from '../config.ts';

export function drawProjectionChart(entries: Entry[]) {

	const d3n = new D3Node();
	const d3 = d3n.d3 as typeof D3;

	const x0 = 70;
	const x1 = width - 10;
	const y0 = height - 30;
	const y1 = 20;
	const svg = d3n.createSVG(width, height) as D3.Selection<SVGElement, unknown, null, undefined>;

	const avg = entries.reduce((acc, entry) => acc + entry.donated, 0) / entries.reduce((acc, entry) => acc + (entry.donated ? 1 : 0), 0);

	const data = [];
	let avgSum = 0;
	let donatedSum = 0;
	let neededSum = 0;
	for (const entry of entries) {
		avgSum += avg;
		donatedSum += entry.donated;
		neededSum += entry.needed;
		data.push({
			label: entry.label,
			avgSum,
			donatedSum,
			hasDonation: entry.donated > 0,
			neededSum,
		})
	};

	// x-axis

	const x = d3.scaleBand()
		.domain(data.map(d => d.label))
		.range([x0, x1]);

	const xAxis = d3.axisBottom(x).tickSize(0);

	svg.append('g')
		.style('font-size', '14px')
		.attr('transform', `translate(0,${y0})`)
		.call(xAxis)
		.selectAll('text')
		.attr('transform', 'translate(0,5)');

	// y-axis

	const y = d3.scaleLinear()
		.domain([0, 20000])
		.range([y0, y1]);

	const yAxis = d3.axisLeft(y).tickFormat(v => Math.round(v.valueOf()) + ' €').ticks(5);

	svg.append('g')
		.style('font-size', '14px')
		.attr('transform', `translate(${x0},0)`)
		.call(yAxis);

	const b = x.bandwidth();

	svg.append('path')
		.datum(data)
		.attr('fill', 'none')
		.attr('stroke', colorRed)
		.attr('stroke-width', 3)
		.attr('d', d3.line<typeof data["0"]>().x((d) => x(d.label)! + b * 0.5).y((d) => y(d.neededSum)));

	svg.append('path')
		.datum(data)
		.attr('fill', 'none')
		.attr('stroke', colorGreen)
		.attr('stroke-width', 3)
		.attr('stroke-dasharray', '3,6')
		.attr('d',
			d3.line<typeof data["0"]>()
				.x((d) => x(d.label)! + b * 0.5)
				.y((d) => y(d.avgSum))
		);

		svg.append('path')
			.datum(data.filter(d => d.hasDonation))
			.attr('fill', 'none')
			.attr('stroke', colorGreen)
			.attr('stroke-width', 3)
			.attr('d',
				d3.line<typeof data["0"]>()
					.x((d) => x(d.label)! + b * 0.5)
					.y((d) => y(d.donatedSum))
			);

	Deno.writeTextFileSync('page/projection_chart.svg', d3n.svgString());
}
