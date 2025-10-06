import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import { terser } from 'rollup-plugin-terser'

export default {
	input: 'src/index.ts', // Entry point
	output: {
		file: 'web/charts.js', // Output file
		format: 'iife', // Immediately Invoked Function Expression for browser compatibility
		sourcemap: true, // Generate a source map for debugging
	},
	plugins: [
		resolve(), // Resolve node_modules imports
		commonjs(), // Convert CommonJS modules to ES6
		typescript(), // Compile TypeScript
		terser(), // Minify the output
	],
}