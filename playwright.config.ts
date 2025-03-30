import { defineConfig } from '@playwright/test'

const WEB_SERVER_PORT = 4173

export default defineConfig({
	testMatch: '**/*.e2e.ts',
	testDir: 'e2e',
	outputDir: 'e2e/e2e-results',
	timeout: 30 * 1000,
	expect: {
		timeout: 10000,
	},
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: [
		[
			'html',
			{
				outputFolder: 'e2e/e2e-reports',
				open: process.env.CI ? 'never' : 'on-failure',
			},
		],
	],
	use: {
		baseURL: `http://localhost:${WEB_SERVER_PORT}`,
		trace: 'retain-on-failure',
	},
})
