/**
 * Entry point for the Donation Dashboard.
 * Loads donation data from a TSV file and renders a column chart and a projection chart.
 */

import { drawColumnChart } from './draw_column_chart';
import { drawProjectionChart } from './draw_projection_chart';
import { loadData, processEntries } from './load_data';

const allData = await loadData('donations.tsv');
const years = [...new Set(allData.map((e) => e.year))].sort((a, b) => a - b);
let selectedYear = Math.max(...years);

function drawCharts(): void {
	const filtered = allData.filter((e) => e.year === selectedYear);
	const processed = processEntries(filtered);
	drawColumnChart('#column_chart', processed);
	drawProjectionChart('#projection_chart', processed);
}

function renderYearSelector(): void {
	const container = document.getElementById('year_selector');
	if (!container) return;
	container.innerHTML = '';

	for (const year of years) {
		const btn = document.createElement('button');
		btn.textContent = String(year);
		if (year === selectedYear) btn.classList.add('active');
		btn.addEventListener('click', () => {
			if (year === selectedYear) return;
			selectedYear = year;
			renderYearSelector();
			drawCharts();
		});
		container.appendChild(btn);
	}
}

renderYearSelector();
drawCharts();

window.addEventListener('resize', drawCharts);
