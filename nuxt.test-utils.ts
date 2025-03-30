import { setup } from '@nuxt/test-utils'

export default async () => {
	await setup({
		// Nuxt test utils setup options
		rootDir: '.',
		server: true,
		browser: false,
	})
}
