import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
	root: 'web',
	base: '/donations/',
	publicDir: '.',
	resolve: {
		alias: {
			'/src': resolve(import.meta.dirname, 'src'),
		},
	},
	build: {
		outDir: '../dist',
		emptyOutDir: true,
	},
	test: {
		root: '.',
	},
})
