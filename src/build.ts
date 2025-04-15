import { loadData } from './lib/data.ts';
import { D3Node } from 'npm:d3-node';
import D3 from 'npm:@types/d3';
import { SVGElement } from 'npm:@types/jsdom'

Deno.chdir(new URL('../', import.meta.url).pathname);

const entries = loadData('donations.tsv');

const d3n = new D3Node();
const d3 = d3n.d3 as typeof D3;

const x0 = 60;
const x1 = 780;
const y0 = 440;
const y1 = 20;
const svg = d3n.createSVG(800, 500) as D3.Selection<SVGElement, unknown, null, undefined>;


// x-axis

const x = d3.scaleBand()
	.domain(entries.map(d => d.label))
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
	.domain([0, 2000])
	.range([y0, y1]);

const yAxis = d3.axisLeft(y).tickFormat(v => Math.round(v.valueOf()) + ' €').ticks(5);

svg.append('g')
	.style('font-size', '14px')
	.attr('transform', `translate(${x0},0)`)
	.call(yAxis);

const b = x.bandwidth();

svg.selectAll('needed')
	.data(entries)
	.enter()
	.append('rect')
	.attr('x', (d) => x(d.label)! + b * 0.3)
	.attr('y', (d) => y(d.needed))
	.attr('width', b * 0.6)
	.attr('height', (d) => y(0) - y(d.needed))
	.attr('fill', '#ad4848')

svg.selectAll('donated')
	.data(entries)
	.enter()
	.append('rect')
	.attr('x', (d) => x(d.label)! + b * 0.1)
	.attr('y', (d) => y(d.donated))
	.attr('width', b * 0.6)
	.attr('height', (d) => y(0) - y(d.donated))
	.attr('fill', '#48AD9C')

Deno.writeTextFileSync('page/column_chart.svg', d3n.svgString());
