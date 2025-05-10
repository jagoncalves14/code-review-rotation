<script setup lang="ts">
import { useAddToast } from '@/composables/useAddToast'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// Define page metadata
definePageMeta({
	layout: 'default',
	middleware: ['admin-only'],
})

// State
interface UserForm {
	id: string
	name: string
	email: string
	is_admin: boolean
	permission: 'view' | 'edit'
}

const user = ref<UserForm>({
	id: '',
	name: '',
	email: '',
	is_admin: false,
	permission: 'view',
})
const loading = ref(true)
const saving = ref(false)
const sendResetPasswordEmail = ref(false)

// Services
const route = useRoute()
const router = useRouter()
const addToast = useAddToast()
const userId = route.params.id as string

// Methods
async function fetchUser() {
	loading.value = true

	try {
		const { getUser } = await import('@/services/users/users.get-user')
		const { data, error } = await getUser(userId)

		if (error) {
			throw error
		}
		if (!data) {
			throw new Error('User not found')
		}

		// Create a fresh object to avoid any reactivity issues
		user.value = {
			id: data.id,
			name: data.name,
			email: data.email,
			is_admin: Boolean(data.is_admin),
			permission: data.permission === 'edit' ? 'edit' : 'view',
		}
	} catch (error) {
		addToast(error instanceof Error ? error.message : 'Failed to load user', { variant: 'danger' })
		router.push('/users')
	} finally {
		loading.value = false
	}
}

async function saveUser() {
	saving.value = true

	try {
		const { updateUser } = await import('@/services/users/users.update-user')

		const { success, error } = await updateUser({
			id: user.value.id,
			name: user.value.name,
			is_admin: user.value.is_admin,
			permission: user.value.permission,
		})

		if (!success) {
			throw new Error(error || 'Failed to update user')
		}

		if (sendResetPasswordEmail.value) {
			await sendPasswordReset()
		} else {
			addToast('User updated successfully')
			router.push('/users')
		}
	} catch (error) {
		addToast(error instanceof Error ? error.message : 'Failed to update user', { variant: 'danger' })
	} finally {
		saving.value = false
	}
}

async function sendPasswordReset() {
	try {
		const { resetPassword } = await import('@/services/users/users.reset-password')
		const { success, error } = await resetPassword(userId)

		if (!success) {
			throw new Error(error || 'Failed to send password reset email')
		}

		addToast('User updated and password reset email sent')
		router.push('/users')
	} catch (error) {
		addToast(error instanceof Error ? error.message : 'Failed to send password reset email', { variant: 'danger' })
	}
}

function cancelEdit() {
	router.push('/users')
}

// Lifecycle
onMounted(async () => {
	await fetchUser()
})
</script>

<template>
	<section class="n-spacing-m n-margin-bs-xl mx-auto w-full max-w-screen-xl">
		<nord-card padding="l">
			<div slot="header">
				<h1 class="n-typography-headline-large">Edit User</h1>
			</div>

			<div class="n-spacing-m">
				<nord-spinner v-if="loading" size="large" class="n-margin-m" />

				<form v-else class="n-stack n-gap-m" @submit.prevent="saveUser">
					<!-- User Information -->
					<div class="n-stack n-gap-m">
						<!-- Name Field -->
						<nord-input
							v-model="user.name"
							label="Name"
							required
							expand
						/>

						<!-- Email Field (Read-only) -->
						<nord-input
							v-model="user.email"
							label="Email"
							readonly
							disabled
							expand
						/>

						<!-- Permissions -->
						<div>
							<nord-fieldset label="Permissions">
								<nord-segmented-control aria-labelledby="permissions-label">
									<nord-segmented-control-item
										size="s"
										label="View only"
										name="permission"
										value="view"
										:checked="user.permission === 'view'"
										@change="user.permission = 'view'"
									/>
									<nord-segmented-control-item
										size="s"
										label="View & Edit"
										name="permission"
										value="edit"
										:checked="user.permission === 'edit'"
										@change="user.permission = 'edit'"
									/>
								</nord-segmented-control>
							</nord-fieldset>

							<!-- Admin Status -->
							<nord-checkbox
								v-model="user.is_admin"
								class="n-margin-bs-m"
								:checked="user.is_admin"
								label="Administrator"
								help-text="Administrators can manage all users and projects"
								@change="user.is_admin = !user.is_admin"
							/>
						</div>

						<nord-divider />

						<!-- Reset Password -->
						<nord-fieldset label="Reset Password" class="n-margin-bs-s">
							<nord-checkbox
								v-model="sendResetPasswordEmail"
								label="Send password reset email"
								help-text="If selected, a password reset link will be sent to the user's email"
							/>
						</nord-fieldset>
					</div>

					<!-- Action Buttons -->
					<div class="n-stack n-stack-horizontal-e n-gap-s n-margin-bs-l">
						<nord-button
							variant="secondary"
							type="button"
							@click="cancelEdit"
						>
							Cancel
						</nord-button>
						<nord-button
							variant="primary"
							type="submit"
							:disabled="saving"
						>
							{{ saving ? 'Saving...' : 'Save User' }}
						</nord-button>
					</div>
				</form>
			</div>
		</nord-card>
	</section>
</template>
