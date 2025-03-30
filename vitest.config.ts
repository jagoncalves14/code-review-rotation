import path from 'node:path'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	plugins: [
		vue({
			template: {
				compilerOptions: {
					// treat all tags with a dash as custom elements
					isCustomElement: tag => tag.includes('-'),
				},
			},
		}),
		AutoImport({
			dts: './tests/auto-imports.d.ts',
			imports: ['vitest', 'vue', 'vue-router'],
		}),
	],
	test: {
		include: ['**/*.spec.ts'],
		environment: 'jsdom',
		globals: true,
		setupFiles: ['./nuxt.test-utils.ts'],
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './'),
		},
	},
})
