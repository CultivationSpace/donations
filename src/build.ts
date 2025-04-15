import { loadData } from './lib/data.ts';
import { drawColumnChart } from "./lib/column_chart.ts";
import { drawProjectionChart } from "./lib/projection_chart.ts";

Deno.chdir(new URL('../', import.meta.url).pathname);

const entries = loadData('donations.tsv');

drawColumnChart(entries);
drawProjectionChart(entries);
