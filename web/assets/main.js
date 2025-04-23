import * as d3 from 'https://cdn.jsdelivr.net/npm/d3/+esm';

export const colorRed = '#AD4848';
export const colorGreen = '#48AD9C';

const data = await loadData('donations.tsv');

drawColumnChart('#column_chart', data);
drawProjectionChart('#projection_chart', data);

async function loadData(file) {
	const data = await d3.tsv(file);
	const entries = data.map(entry => {
		const date = entry.month.split('-');
		const year = parseInt(date[0], 10);
		const month = parseInt(date[1], 10);

		let label = '';
		switch (month) {
			case 1: label = 'Jan'; break;
			case 2: label = 'Feb'; break;
			case 3: label = 'Mar'; break;
			case 4: label = 'Apr'; break;
			case 5: label = 'May'; break;
			case 6: label = 'Jun'; break;
			case 7: label = 'Jul'; break;
			case 8: label = 'Aug'; break;
			case 9: label = 'Sep'; break;
			case 10: label = 'Oct'; break;
			case 11: label = 'Nov'; break;
			case 12: label = 'Dec'; break;
		}

		return {
			label,
			column: (year - 2020) * 12 + month - 1,
			donors: parseInt(entry.donors, 10),
			donated: parseFloat(entry.donated),
			needed: parseFloat(entry.needed),
		};
	});

	entries.sort((a, b) => a.column - b.column);


	const totalDonated = entries.reduce((acc, entry) => acc + entry.donated, 0);
	const countDonationMonths = entries.reduce((acc, entry) => acc + (entry.donated ? 1 : 0), 0);
	const avgDonated = totalDonated / countDonationMonths;

	let sumProjectedDonations = 0;
	let sumDonated = 0;
	let sumNeeded = 0;
	entries.forEach((entry, i) => {
		sumProjectedDonations += avgDonated;
		sumDonated += entry.donated;
		sumNeeded += entry.needed;

		entry.sumProjectedDonations = sumProjectedDonations;
		entry.sumDonated = sumDonated;
		entry.hasDonation = entry.donated > 0;
		entry.sumNeeded = sumNeeded;
	});

	return entries;
}

function drawColumnChart(query, data) {
	const margin = { left: 60, right: 10, top: 20, bottom: 30 };

	const container = document.querySelector(query);
	const width = container.clientWidth;
	const height = container.clientHeight;

	const x0 = margin.left;
	const x1 = width - margin.right;
	const y0 = height - margin.bottom;
	const y1 = margin.top;

	const svg = d3.create('svg')
		.attr('width', width)
		.attr('height', height)
		.attr('viewBox', [0, 0, width, height])
		.style('font-family', 'sans-serif')
		.style('font-size', '10px');


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
		.domain([0, 2000])
		.range([y0, y1]);

	const yAxis = d3.axisLeft(y).tickFormat(v => formatCurrency(v.valueOf())).ticks(5);

	svg.append('g')
		.style('font-size', '14px')
		.attr('transform', `translate(${x0},0)`)
		.call(yAxis);

	const b = x.bandwidth();

	svg.selectAll('needed')
		.data(data)
		.enter()
		.append('rect')
		.attr('x', (d) => x(d.label) + b * 0.3)
		.attr('y', (d) => y(d.needed))
		.attr('width', b * 0.6)
		.attr('height', (d) => y(0) - y(d.needed))
		.attr('fill', colorRed)

	svg.selectAll('donated')
		.data(data)
		.enter()
		.append('rect')
		.attr('x', (d) => x(d.label) + b * 0.1)
		.attr('y', (d) => y(d.donated))
		.attr('width', b * 0.6)
		.attr('height', (d) => y(0) - y(d.donated))
		.attr('fill', colorGreen)

	container.append(svg.node());
}

function drawProjectionChart(query, data) {
	const margin = { left: 70, right: 10, top: 20, bottom: 30 };

	const container = document.querySelector(query);
	const width = container.clientWidth;
	const height = container.clientHeight;

	const x0 = margin.left;
	const x1 = width - margin.right;
	const y0 = height - margin.bottom;
	const y1 = margin.top;

	const svg = d3.create('svg')
		.attr('width', width)
		.attr('height', height)
		.attr('viewBox', [0, 0, width, height])
		.style('font-family', 'sans-serif')
		.style('font-size', '10px');

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

	const yAxis = d3.axisLeft(y).tickFormat(v => formatCurrency(v.valueOf())).ticks(5);

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
		.attr('d', d3.line().x((d) => x(d.label) + b * 0.5).y((d) => y(d.sumNeeded)));

	svg.append('path')
		.datum(data)
		.attr('fill', 'none')
		.attr('stroke', colorGreen)
		.attr('stroke-width', 3)
		.attr('stroke-dasharray', '3,6')
		.attr('d',
			d3.line()
				.x((d) => x(d.label) + b * 0.5)
				.y((d) => y(d.sumProjectedDonations))
		);

	svg.append('path')
		.datum(data.filter(d => d.hasDonation))
		.attr('fill', 'none')
		.attr('stroke', colorGreen)
		.attr('stroke-width', 3)
		.attr('d',
			d3.line()
				.x((d) => x(d.label) + b * 0.5)
				.y((d) => y(d.sumDonated))
		);

	const sumProjectedDonations = data[data.length - 1].sumProjectedDonations;
	const sumNeeded = data[data.length - 1].sumNeeded;
	const difference = sumProjectedDonations - sumNeeded;

	if (difference < 0) {
		const yp = y(sumProjectedDonations);
		const yn = y(sumNeeded);
		const xa = x1 - b * 0.3;
		const xm = xa + 5;

		const path = d3.line()([[xa, yn], [xm, yn], [xm, yp], [xa, yp]]);
		console.log(path);

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
			.attr('fill', colorRed);

	}

	container.append(svg.node());
}

function formatCurrency(value) {
	let text = value.toFixed(0);
	// add thousand separator
	text = text.replace(/\B(?=(\d{3})+(?!\d))/g, "'");
	return text + ' €';
}
