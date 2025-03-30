<script lang="ts" setup>
import type { ResetPasswordSchemaErrorsType, ResetPasswordSchemaType } from '@/schemas/auth'
import { ResetPasswordSchema } from '@/schemas/auth'
import resetPassword from '@/services/auth/auth.reset-password'
import getAccessToken from '@/utils/getAccessToken'

const isLoading = ref(false)
const formErrors = ref<ResetPasswordSchemaErrorsType>(null)
const formData = ref<ResetPasswordSchemaType>({
	password: '',
})

const shouldRevealPassword = ref(false)
function onRevealPasswordCheckboxChange(event: Event) {
	const isChecked = (event?.target as HTMLInputElement)?.checked
	shouldRevealPassword.value = isChecked
}

async function handleSubmit() {
	isLoading.value = true

	const schemaValidation = ResetPasswordSchema.safeParse(formData.value)
	if (!schemaValidation.success) {
		formErrors.value = schemaValidation?.error?.format()
		isLoading.value = false
		return
	}

	const accessToken = getAccessToken()
	const { error } = await resetPassword(accessToken)

	if (error) {
		alert(error.message)
	} else {
		navigateTo('/')
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
							v-model="formData.password"
							label="Password"
							expand
							required
							hide-required
							name="password"
							autocomplete="password"
							placeholder="Enter your password"
							size="m"
							:type="shouldRevealPassword ? 'text' : 'password'"
							:error="formErrors?.password?._errors"
						/>
						<nord-checkbox
							v-model="shouldRevealPassword"
							:label="`${shouldRevealPassword ? 'Hide' : 'Show'} password`"
							class="mt-2"
							size="s"
							@change="onRevealPasswordCheckboxChange"
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
