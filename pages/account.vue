<script setup lang="ts">
import type { AccountSchemaErrorsType, AccountSchemaType } from '@/schemas/account'
import getProfile from '@/services/auth/auth.get-profile'
import updateAccount from '@/services/auth/auth.update-account'

definePageMeta({
	title: 'Nordhealth DS — Account',
})

const user = useSupabaseUser()
const addToast = useAddToast()

const isLoading = ref(false)
const hasRequestedPasswordReset = ref(false)

const formErrors = ref<AccountSchemaErrorsType | null>(null)
const formData = ref<AccountSchemaType>({
	name: '',
	email: user.value?.email || '',
	currentPassword: '',
	newPassword: '',
	confirmNewPassword: '',
})

async function handleSubmit() {
	isLoading.value = true
	formErrors.value = null

	try {
		const result = await updateAccount(formData.value)

		if (result.success) {
			addToast('Account updated successfully')
			// Reset form on success
			formData.value = {
				name: formData.value.name,
				email: formData.value.email,
				currentPassword: '',
				newPassword: '',
				confirmNewPassword: '',
			}
		} else {
			if (result.error === 'Current password is incorrect') {
				formErrors.value = Object.assign({}, formErrors.value);
				(formErrors.value as AccountSchemaErrorsType)!.currentPassword = {
					_errors: [result.error],
				}
				return
			}
			addToast(result.error || 'Failed to update account', { variant: 'danger' })
		}
	} catch (error) {
		if (error instanceof Error) {
			addToast(error.message, { variant: 'danger' })
		}
	} finally {
		isLoading.value = false
	}
}

async function handleDeleteClick() {
	const confirmedDeletion = confirm('Are you sure you want to delete your account?')
	if (!confirmedDeletion) {
		return
	}

	handleDeleteUser()
}

async function handleDeleteUser() {
	isLoading.value = true

	try {
		const userId = user?.value?.id
		if (!(typeof userId === 'string')) {
			return navigateTo('/sign-in')
		}

		const response = await fetch('/api/delete-user', {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ userId }),
		})

		if (!response.ok) {
			throw new Error(`${response.status} ${response.statusText}`)
		}

		addToast('Your account has been deleted.')
		navigateTo('/sign-in')
	} catch (error) {
		if (error instanceof Error) {
			addToast(error.message, { variant: 'danger' })
		}
	} finally {
		isLoading.value = false
	}
}

async function sendPasswordReset() {
	hasRequestedPasswordReset.value = true

	try {
		const supabase = useSupabaseClient()

		const { error } = await supabase.auth.resetPasswordForEmail(
			formData.value.email || '',
			{ redirectTo: `${window.location.origin}/reset-password` },
		)

		if (error) {
			throw error
		}

		addToast('Password reset email sent successfully')
	} catch (error) {
		addToast(error instanceof Error ? error.message : 'Failed to send password reset email', { variant: 'danger' })
		hasRequestedPasswordReset.value = false
	}
}

onMounted(async () => {
	const { data, error } = await getProfile()
	if (data?.name) {
		formData.value.name = data.name
	}
	if (error) {
		console.error('Error fetching profile:', error.message)
	}
})
</script>

<template>
	<main class="n-stack-horizontal mx-auto h-full w-full max-w-screen-md">
		<nord-card class="md:my-10" padding="l">
			<nord-stack class="stack" direction="vertical" align-items="stretch">
				<div class="py-5 md:px-10">
					<h1>Account</h1>
				</div>

				<nord-card gap="l" direction="vertical" padding="l" class="pb-10 md:px-10">
					<div slot="header">Account Details</div>
					<nord-stack gap="l" direction="vertical" align-items="stretch">
						<p class="n-color-text-weaker">Update your account details here.</p>

						<!-- Account Update Form -->
						<form @submit.prevent="handleSubmit">
							<nord-stack gap="m" direction="vertical" align-items="stretch">
								<!-- Email -->
								<nord-input
									v-model="formData.email"
									label="Email"
									expand
									required
									hide-required
									name="email"
									autocomplete="email"
									type="email"
									placeholder="Enter your email"
									size="m"
									:error="formErrors?.email?._errors"
								/>

								<!-- Name -->
								<nord-input
									v-model="formData.name"
									label="Name"
									expand
									required
									hide-required
									name="name"
									autocomplete="name"
									placeholder="Enter your name"
									size="m"
									:error="formErrors?.name?._errors"
								/>

								<!-- Submit Button -->
								<nord-button
									type="submit"
									expand
									variant="primary"
									size="m"
									:disabled="isLoading"
								>
									{{ isLoading ? 'Saving...' : 'Save Changes' }}
								</nord-button>
							</nord-stack>
						</form>

						<!-- Add the password reset section after the form -->
						<div class="py-5">
							<nord-divider />
						</div>

						<!-- Password Reset Section -->
						<nord-fieldset label="Reset Password" class="n-margin-bs-s">
							<nord-stack gap="m" direction="vertical" align-items="stretch">
								<p class="n-color-text-weaker">
									Alternatively, you can request a password reset email. This will send an email with a link to reset your password.
								</p>
								<nord-button
									variant="secondary"
									type="button"
									:disabled="hasRequestedPasswordReset"
									@click="sendPasswordReset"
								>
									{{ hasRequestedPasswordReset ? 'Sending...' : 'Send Password Reset' }}
								</nord-button>
							</nord-stack>
						</nord-fieldset>

						<div class="py-5">
							<nord-divider />
						</div>

						<!-- Delete Account Section -->
						<nord-stack class="stack" direction="vertical" align-items="stretch">
							<h2 class="n-color-text-danger">Delete your account</h2>
							<p class="n-color-text-weaker">
								Once you delete your account, there is no going back. <br>Please be certain.
							</p>
							<nord-button
								variant="danger"
								type="button"
								size="m"
								:disabled="isLoading"
								@click="handleDeleteClick"
							>
								Delete account
							</nord-button>
						</nord-stack>
					</nord-stack>
				</nord-card>
			</nord-stack>
		</nord-card>
	</main>
</template>
