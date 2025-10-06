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

import { drawColumnChart } from './draw_column_chart'
import { drawProjectionChart } from './draw_projection_chart'
import { loadData } from './load_data'

/**
 * Entry point – asynchronous IIFE (Immediately Invoked Function
 * Expression) so we can use `await` at the top level in plain
 * browsers. It loads the TSV data and renders both charts.
 */
;(async () => {
	const data = await loadData('donations.tsv') // Load data from a TSV file
	drawColumnChart('#column_chart', data) // Draw the column chart
	drawProjectionChart('#projection_chart', data) // Draw the projection chart
})()
