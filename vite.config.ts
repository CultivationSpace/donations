import { defineConfig } from 'vite'

export default defineConfig({
	root: 'web',
	publicDir: '.',
	build: {
		outDir: '../dist',
		emptyOutDir: true,
	},
})
