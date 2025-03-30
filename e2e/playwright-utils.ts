import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export class PlayWrightUtils {
	readonly page: Page

	constructor(page: Page) {
		this.page = page
	}

	async validateURL(targetURL: `${'/'}${string}`) {
		const domainURL = new URL(this.page.url()).origin

		// Assert page redirected correctly
		await this.page.waitForURL(`${domainURL}${targetURL}`)
		const currentURL = new URL(this.page.url()).pathname
		await expect(currentURL).toBe(targetURL)
	}
}
