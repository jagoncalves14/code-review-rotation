<script setup lang="ts">
import { useAddToast } from '@/composables/useAddToast'
import getProfile from '@/services/auth/auth.get-profile'
import updateAccount from '@/services/auth/auth.update-account'
import { onMounted, ref } from 'vue'

// Define page metadata
definePageMeta({
	layout: 'default',
	title: 'Account Settings',
})

// State
interface AccountForm {
	name: string
	email: string
}

const user = useSupabaseUser()
const addToast = useAddToast()
const loading = ref(true)
const saving = ref(false)
const resetPasswordInProgress = ref(false)
const accountForm = ref<AccountForm>({
	name: '',
	email: user.value?.email || '',
})
const isAdmin = ref(false)

// Methods
async function fetchProfile() {
	loading.value = true

	try {
		const { data, error } = await getProfile()

		if (error) {
			throw error
		}

		if (data) {
			accountForm.value = {
				name: data.name || '',
				email: user.value?.email || '',
			}
			isAdmin.value = !!data.is_admin
		}
	} catch (error) {
		addToast(error instanceof Error ? error.message : 'Failed to load profile', { variant: 'danger' })
	} finally {
		loading.value = false
	}
}

async function saveAccount() {
	saving.value = true

	try {
		const result = await updateAccount({
			name: accountForm.value.name,
			email: accountForm.value.email,
			currentPassword: '',
			newPassword: '',
			confirmNewPassword: '',
		})

		if (!result.success) {
			throw new Error(result.error || 'Failed to update account')
		}

		addToast('Account updated successfully')
	} catch (error) {
		addToast(error instanceof Error ? error.message : 'Failed to update account', { variant: 'danger' })
	} finally {
		saving.value = false
	}
}

async function sendPasswordReset() {
	resetPasswordInProgress.value = true

	try {
		const supabase = useSupabaseClient()

		const { error } = await supabase.auth.resetPasswordForEmail(
			accountForm.value.email,
			{ redirectTo: `${window.location.origin}/reset-password` },
		)

		if (error) {
			throw error
		}

		addToast('Password reset email sent successfully')
	} catch (error) {
		addToast(error instanceof Error ? error.message : 'Failed to send password reset email', { variant: 'danger' })
	} finally {
		resetPasswordInProgress.value = false
	}
}

async function handleDeleteAccount() {
	const confirmedDeletion = confirm('Are you sure you want to delete your account? This action cannot be undone.')
	if (!confirmedDeletion) {
		return
	}

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
		addToast(error instanceof Error ? error.message : 'Failed to delete account', { variant: 'danger' })
	}
}

// Lifecycle
onMounted(fetchProfile)
</script>

<template>
	<section class="n-spacing-m n-margin-bs-xl mx-auto w-full max-w-screen-xl">
		<nord-card padding="l">
			<div slot="header">
				<h1 class="n-typography-headline-large">Account Settings</h1>
			</div>

			<div class="n-spacing-m">
				<nord-spinner v-if="loading" size="large" class="n-margin-m" />

				<div v-else>
					<!-- Admin Banner -->
					<nord-alert v-if="isAdmin" variant="info" class="n-margin-bs-l">
						<nord-icon slot="prefix" name="lock" />
						You are an admin and can manage other users and projects.
					</nord-alert>

					<form class="n-stack n-gap-m" @submit.prevent="saveAccount">
						<!-- User Information -->
						<div class="n-stack n-gap-m">
							<!-- Name Field -->
							<nord-input
								v-model="accountForm.name"
								label="Name"
								required
								expand
							/>

							<!-- Email Field (Read-only) -->
							<nord-input
								v-model="accountForm.email"
								label="Email"
								readonly
								disabled
								expand
							/>
						</div>

						<!-- Account Update Button -->
						<div class="n-stack n-stack-horizontal-e n-gap-s">
							<nord-button
								variant="primary"
								type="submit"
								:disabled="saving"
							>
								{{ saving ? 'Saving...' : 'Save Changes' }}
							</nord-button>
						</div>
					</form>

					<nord-divider class="n-margin-bs-l n-margin-be-l" />

					<!-- Password Reset Section -->
					<nord-fieldset label="Reset Password" class="n-margin-bs-s">
						<nord-stack gap="m" direction="vertical" align-items="stretch">
							<p class="n-color-text-weaker">
								Request a password reset email. This will send an email with a link to reset your password.
							</p>
							<nord-button
								variant="secondary"
								type="button"
								:disabled="resetPasswordInProgress"
								@click="sendPasswordReset"
							>
								{{ resetPasswordInProgress ? 'Sending...' : 'Send Password Reset' }}
							</nord-button>
						</nord-stack>
					</nord-fieldset>

					<nord-divider class="n-margin-bs-l n-margin-be-l" />

					<!-- Delete Account Section -->
					<nord-fieldset label="Delete Account" class="n-margin-bs-s">
						<nord-stack gap="m" direction="vertical" align-items="stretch">
							<p class="n-color-text-danger">
								Once you delete your account, there is no going back. Please be certain.
							</p>
							<nord-button
								variant="danger"
								type="button"
								@click="handleDeleteAccount"
							>
								Delete Account
							</nord-button>
						</nord-stack>
					</nord-fieldset>
				</div>
			</div>
		</nord-card>
	</section>
</template>
