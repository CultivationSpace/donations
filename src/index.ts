/**
 * Entry point for the Donation Dashboard.
 * Loads donation data from a TSV file and renders a column chart and a projection chart.
 */

import { drawColumnChart } from './draw_column_chart'
import { drawProjectionChart } from './draw_projection_chart'
import { loadData } from './load_data'

const data = await loadData('donations.tsv')
drawColumnChart('#column_chart', data)
drawProjectionChart('#projection_chart', data)
