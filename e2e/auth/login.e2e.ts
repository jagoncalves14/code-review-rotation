import { expect, test } from '@playwright/test'
import { PlayWrightUtils } from '../playwright-utils'

const DOMAIN = 'https://nuxt3-nh-login.vercel.app'
const CREDENTIALS = {
	username: 'qatester@gmail.com',
	password: '123456',
}
const WRONG_CREDENTIALS = {
	alreadyExistingUsername: 'joaoandretgoncalves@gmail.com',
	wrongPassword: '1234567',
	invalidUsername: 'qatester',
	invalidPassword: '123',
}

let utils: PlayWrightUtils
test.beforeEach(({ page }) => {
	utils = new PlayWrightUtils(page)
})

test('Sign Up', async ({ page }) => {
	await page.goto(`${DOMAIN}/`)

	await page.getByRole('button', { name: 'Sign up' }).click()

	await utils.validateURL('/sign-up')

	// Fill form incorrectly
	await page.getByPlaceholder('Enter your email').click()
	await page.getByPlaceholder('Enter your email').fill(WRONG_CREDENTIALS.invalidUsername)
	await page.getByPlaceholder('Enter your email').press('Tab')
	await page.getByPlaceholder('Enter your password').fill(WRONG_CREDENTIALS.invalidPassword)
	await page.getByRole('button', { name: 'Sign up' }).click()

	// Errors should display
	await expect(page.getByText('String must contain at least')).toBeVisible()
	await expect(page.getByText('This is not a valid email.')).toBeVisible()

	// Fill form incorrectly - user that is already registered
	await page.getByPlaceholder('Enter your email').fill(WRONG_CREDENTIALS.alreadyExistingUsername)
	await page.getByPlaceholder('Enter your password').fill(CREDENTIALS.password)
	await page.getByRole('button', { name: 'Sign up' }).click()

	// Error should display
	await expect(page.getByText('User already registered')).toBeVisible()

	// Fill form correctly
	await page.getByPlaceholder('Enter your email').fill(CREDENTIALS.username)
	await page.getByRole('button', { name: 'Sign up' }).click()

	// Should redirect user to sign in page
	await utils.validateURL('/')
})

test('Sign in', async ({ page }) => {
	await page.goto(`${DOMAIN}/`)

	// Fill form incorrectly
	await page.getByPlaceholder('Enter your email').click()
	await page.getByPlaceholder('Enter your email').fill(WRONG_CREDENTIALS.invalidUsername)
	await page.getByPlaceholder('Enter your email').press('Tab')
	await page.getByPlaceholder('Enter your password').fill(WRONG_CREDENTIALS.invalidPassword)
	await page.getByRole('button', { name: 'Sign in' }).click()

	// Errors should display
	await expect(page.getByText('String must contain at least')).toBeVisible()
	await expect(page.getByText('This is not a valid email.')).toBeVisible()

	// Fill form correctly
	await page.getByPlaceholder('Enter your email').click()
	await page.getByPlaceholder('Enter your email').fill(CREDENTIALS.username)
	await page.getByPlaceholder('Enter your email').press('Tab')
	await page.getByPlaceholder('Enter your password').fill(CREDENTIALS.password)
	await page.getByRole('button', { name: 'Sign in' }).click()

	await utils.validateURL('/')
})

test('Sign out', async ({ page }) => {
	await page.goto(`${DOMAIN}/`)
	await page.goto(`${DOMAIN}/sign-in`)
	await page.getByPlaceholder('Enter your email').click()
	await page.getByPlaceholder('Enter your email').fill(CREDENTIALS.username)
	await page.getByPlaceholder('Enter your email').press('Tab')
	await page.getByPlaceholder('Enter your password').fill(CREDENTIALS.password)
	await page.getByRole('button', { name: 'Sign in' }).click()

	await utils.validateURL('/')

	await page.getByRole('button', { name: 'Sign out' }).click()

	await utils.validateURL('/sign-in')
})

test('Forgot Password', async ({ page }) => {
	await page.route('*/**/auth/v1/recover**', async (route) => {
		route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify({ success: true }),
		})
	})

	await page.goto(`${DOMAIN}/`)

	// Go to Forgot Password page
	await page.getByRole('link', { name: 'Forgot password?' }).click()
	await utils.validateURL('/forgot-password')

	// Fill form incorrectly
	await page.getByPlaceholder('Enter your email').fill('joaoan')
	await page.getByRole('button', { name: 'Submit' }).click()

	// Errors should display
	await expect(page.getByText('This is not a valid email.')).toBeVisible()

	// Fill form correctly
	await page.getByPlaceholder('Enter your email').fill(CREDENTIALS.username)
	// Click button - and wait for the 'dialog' event
	page.on('dialog', async (alert) => {
		await expect(alert.message()).toBe(`Password reset link has been sent to your email. Please check your inbox. If you don't see it, please also check your spam folder.`)
		await alert.accept()
	})
	await page.getByRole('button', { name: 'Submit' }).click()
	await	utils.validateURL('/forgot-password')
})

test('Delete user', async ({ page }) => {
	await page.goto(`${DOMAIN}/`)
	await page.goto(`${DOMAIN}/sign-in`)
	await page.getByPlaceholder('Enter your email').click()
	await page.getByPlaceholder('Enter your email').fill(CREDENTIALS.username)
	await page.getByPlaceholder('Enter your email').press('Tab')
	await page.getByPlaceholder('Enter your password').fill(CREDENTIALS.password)
	await page.getByRole('button', { name: 'Sign in' }).click()

	await utils.validateURL('/')

	await page.getByRole('link', { name: 'Account' }).click()

	await utils.validateURL('/account')

	const hasDialogOpened = []
	page.on('dialog', async (alert) => {
		hasDialogOpened.push(true)

		if (hasDialogOpened?.length <= 2) {
			await expect(alert.message()).toBe('Are you sure you want to delete your account?')
		} else {
			await expect(alert.message()).toBe('Your account has been deleted.')
		}

		if (hasDialogOpened?.length === 1) {
			await alert.dismiss()
		} else {
			await alert.accept()
		}
	})

	await page.getByRole('button', { name: 'Delete account' }).click()

	// Should remain in the same page
	await utils.validateURL('/account')

	await page.getByRole('button', { name: 'Delete account' }).click()

	// Should remain in the same page
	await utils.validateURL('/sign-in')
})
