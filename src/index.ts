/**
 * @fileoverview Donation Dashboard Renderer
 *
 * This script serves as the entry point for rendering the Donation Dashboard.
 * It loads donation data from a TSV file and renders two interactive D3.js charts:
 *
 * 1. **Column Chart**:
 *    - Compares monthly donations (green) with monthly needs (red).
 *    - Provides a clear visual representation of how donations align with expenses.
 *
 * 2. **Projection Chart**:
 *    - Displays cumulative totals for donations and expenses.
 *    - Projects year-end donations based on recent trends.
 *    - Highlights any potential funding shortfall.
 *
 * The script is designed to run directly in the browser using `<script type="module">`.
 * It does not require additional build tooling for execution.
 *
 * Dependencies:
 * - `drawColumnChart`: Renders the column chart.
 * - `drawProjectionChart`: Renders the projection chart.
 * - `loadData`: Loads and processes the donation data from a TSV file.
 *
 * Usage:
 * - Ensure the `donations.tsv` file is available in the same directory.
 * - Include this script in your HTML file with a `<script type="module">` tag.
 * - The charts will be rendered in the elements with IDs `#column_chart` and `#projection_chart`.
 */

import { drawColumnChart } from './draw_column_chart'
import { drawProjectionChart } from './draw_projection_chart'
import { loadData } from './load_data'

/**
 * Entry Point
 *
 * This asynchronous Immediately Invoked Function Expression (IIFE) initializes
 * the Donation Dashboard. It performs the following steps:
 *
 * 1. Loads donation data from the `donations.tsv` file.
 * 2. Renders the column chart in the element with ID `#column_chart`.
 * 3. Renders the projection chart in the element with ID `#projection_chart`.
 */
;(async () => {
	// Load donation data from the TSV file
	const data = await loadData('donations.tsv')

	// Render the column chart
	drawColumnChart('#column_chart', data)

	// Render the projection chart
	drawProjectionChart('#projection_chart', data)
})()
