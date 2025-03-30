<script lang="ts" setup>
import type { ForgotPasswordSchemaErrorsType, ForgotPasswordSchemaType } from '@/schemas/auth'
import { ForgotPasswordSchema } from '@/schemas/auth'
import forgotPassword from '@/services/auth/auth.forgot-password'

useHead({
	title: 'Nordhealth DS — Forgot password',
})

const isLoading = ref(false)

const formErrors = ref<ForgotPasswordSchemaErrorsType>(null)
const formData = ref<ForgotPasswordSchemaType>({
	email: '',
})

async function handleSubmit() {
	isLoading.value = true

	const schemaValidation = ForgotPasswordSchema.safeParse(formData.value)
	if (!schemaValidation.success) {
		formErrors.value = schemaValidation?.error?.format()
		isLoading.value = false
		return
	}

	const { data, error } = await forgotPassword(formData.value.email)

	if (data) {
		alert(`Password reset link has been sent to your email. Please check your inbox. If you don't see it, please also check your spam folder.`)
	} else if (error) {
		alert(error.message)
	}

	isLoading.value = false
}
</script>

<template>
	<main class="n-stack-horizontal h-full flex-1">
		<nord-stack class="stack" direction="vertical" align-items="stretch">
			<nord-card padding="l">
				<div slot="header">
					Lost your password?
				</div>

				<form @submit.prevent="handleSubmit">
					<nord-stack gap="m" direction="vertical" align-items="stretch">
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
						<nord-button
							label="Password"
							expand
							variant="primary"
							type="submit"
							size="m"
							:disabled="isLoading"
						>
							{{ isLoading ? 'Loading' : 'Submit' }}
						</nord-button>
					</nord-stack>
				</form>
			</nord-card>
		</nord-stack>
	</main>
</template>

<style scoped lang="scss">
.stack {
	inline-size: 90%;
	max-inline-size: 340px;
	margin: var(--n-space-xl) auto;
}
</style>
