// Define color constants for the charts
export const colorRed = '#AD4848';
export const colorGreen = '#48AD9C';

// Immediately invoked async function to load data and draw charts
(async () => {
	const data = await loadData('donations.tsv'); // Load data from a TSV file
	drawColumnChart('#column_chart', data); // Draw the column chart
	drawProjectionChart('#projection_chart', data); // Draw the projection chart
})();

// Function to load and process data from a TSV file
async function loadData(file) {
	let data;
	try {
		// Load the TSV file using d3.tsv
		data = await d3.tsv(file);
	} catch (error) {
		// Log an error if the file cannot be parsed
		console.error(`Error parsing the file ${file}:`, error);
		return [];
	}

	// Map and process each entry in the data
	const entries = data.map(entry => {
		const date = entry.month.split('-'); // Split the month into year and month
		const year = parseInt(date[0], 10);
		const month = parseInt(date[1], 10);

		// Convert month number to a short label
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

		// Return a processed entry object
		return {
			label,
			column: (year - 2020) * 12 + month - 1, // Calculate column index
			donors: parseInt(entry.donors, 10), // Parse donors as integer
			donated: parseFloat(entry.donated), // Parse donated amount as float
			needed: parseFloat(entry.needed), // Parse needed amount as float
		};
	});

	// Sort entries by column index
	entries.sort((a, b) => a.column - b.column);

	// Calculate total donations and average donations
	const totalDonated = entries.reduce((acc, entry) => acc + entry.donated, 0);
	const countDonationMonths = entries.reduce((acc, entry) => acc + (entry.donated ? 1 : 0), 0);
	const avgDonated = totalDonated / countDonationMonths;

	// Add cumulative and projected data to each entry
	let sumProjectedDonations = 0;
	let sumDonated = 0;
	let sumNeeded = 0;
	entries.forEach((entry, i) => {
		sumProjectedDonations += avgDonated; // Cumulative projected donations
		sumDonated += entry.donated; // Cumulative donated amount
		sumNeeded += entry.needed; // Cumulative needed amount

		entry.sumProjectedDonations = sumProjectedDonations;
		entry.sumDonated = sumDonated;
		entry.hasDonation = entry.donated > 0; // Flag if donation exists
		entry.sumNeeded = sumNeeded;
	});

	return entries; // Return processed entries
}

// Function to draw a column chart
function drawColumnChart(query, data) {
	const margin = { left: 60, right: 10, top: 20, bottom: 30 }; // Chart margins

	// Get container dimensions
	const container = document.querySelector(query);
	const width = container.clientWidth;
	const height = container.clientHeight;

	// Define chart boundaries
	const x0 = margin.left;
	const x1 = width - margin.right;
	const y0 = height - margin.bottom;
	const y1 = margin.top;

	// Create an SVG element
	const svg = d3.create('svg')
		.attr('width', width)
		.attr('height', height)
		.attr('viewBox', [0, 0, width, height])
		.style('font-family', 'sans-serif')
		.style('font-size', '10px');

	// Define x-axis scale and axis
	const x = d3.scaleBand()
		.domain(data.map(d => d.label)) // Use labels as domain
		.range([x0, x1]); // Map to chart width

	const xAxis = d3.axisBottom(x).tickSize(0); // Create x-axis

	// Add x-axis to the chart
	svg.append('g')
		.style('font-size', '14px')
		.attr('transform', `translate(0,${y0})`)
		.call(xAxis)
		.selectAll('text')
		.attr('transform', 'translate(0,5)');

	// Define y-axis scale and axis
	const y = d3.scaleLinear()
		.domain([0, 2000]) // Fixed range for y-axis
		.range([y0, y1]);

	const yAxis = d3.axisLeft(y).tickFormat(v => formatCurrency(v)).ticks(5);

	// Add y-axis to the chart
	svg.append('g')
		.style('font-size', '14px')
		.attr('transform', `translate(${x0},0)`)
		.call(yAxis);

	const b = x.bandwidth(); // Get bandwidth for bars

	// Add bars for "needed" values
	svg.selectAll('needed')
		.data(data)
		.enter()
		.append('rect')
		.attr('x', (d) => x(d.label) + b * 0.3)
		.attr('y', (d) => y(d.needed))
		.attr('width', b * 0.6)
		.attr('height', (d) => y(0) - y(d.needed))
		.attr('fill', colorRed);

	// Add bars for "donated" values
	svg.selectAll('donated')
		.data(data)
		.enter()
		.append('rect')
		.attr('x', (d) => x(d.label) + b * 0.1)
		.attr('y', (d) => y(d.donated))
		.attr('width', b * 0.6)
		.attr('height', (d) => y(0) - y(d.donated))
		.attr('fill', colorGreen);

	// Append the SVG to the container
	container.append(svg.node());
}

// Function to draw a projection chart
function drawProjectionChart(query, data) {
	const margin = { left: 70, right: 10, top: 20, bottom: 30 }; // Chart margins

	// Get container dimensions
	const container = document.querySelector(query);
	const width = container.clientWidth;
	const height = container.clientHeight;

	// Define chart boundaries
	const x0 = margin.left;
	const x1 = width - margin.right;
	const y0 = height - margin.bottom;
	const y1 = margin.top;

	// Create an SVG element
	const svg = d3.create('svg')
		.attr('width', width)
		.attr('height', height)
		.attr('viewBox', [0, 0, width, height])
		.style('font-family', 'sans-serif')
		.style('font-size', '10px');

	// Define x-axis scale and axis
	const x = d3.scaleBand()
		.domain(data.map(d => d.label)) // Use labels as domain
		.range([x0, x1]); // Map to chart width

	const xAxis = d3.axisBottom(x).tickSize(0); // Create x-axis

	// Add x-axis to the chart
	svg.append('g')
		.style('font-size', '14px')
		.attr('transform', `translate(0,${y0})`)
		.call(xAxis)
		.selectAll('text')
		.attr('transform', 'translate(0,5)');

	// Define y-axis scale and axis
	const y = d3.scaleLinear()
		.domain([0, 20000]) // Fixed range for y-axis
		.range([y0, y1]);

	const yAxis = d3.axisLeft(y).tickFormat(v => formatCurrency(v.valueOf())).ticks(5);

	// Add y-axis to the chart
	svg.append('g')
		.style('font-size', '14px')
		.attr('transform', `translate(${x0},0)`)
		.call(yAxis);

	const b = x.bandwidth(); // Get bandwidth for bars

	// Add line for "needed" values
	svg.append('path')
		.datum(data)
		.attr('fill', 'none')
		.attr('stroke', colorRed)
		.attr('stroke-width', 3)
		.attr('d', d3.line().x((d) => x(d.label) + b * 0.5).y((d) => y(d.sumNeeded)));

	// Add dashed line for "projected donations"
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

	// Add line for "actual donations"
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

	// Calculate the difference between projected and needed donations
	const sumProjectedDonations = data[data.length - 1].sumProjectedDonations;
	const sumNeeded = data[data.length - 1].sumNeeded;
	const difference = sumProjectedDonations - sumNeeded;

	// If there is a shortfall, draw an annotation
	if (difference < 0) {
		const yp = y(sumProjectedDonations);
		const yn = y(sumNeeded);
		const xa = x1 - b * 0.3;
		const xm = xa + 5;

		const path = d3.line()([[xa, yn], [xm, yn], [xm, yp], [xa, yp]]);

		svg.append('path')
			.attr('d', path)
			.attr('fill', 'none')
			.attr('stroke', '#000')
			.attr('stroke-width', 1.5);

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
			.attr('fill', colorRed);
	}

	// Append the SVG to the container
	container.append(svg.node());
}

// Function to format currency values
function formatCurrency(value) {
	return value.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, "'") + ' €';
}
