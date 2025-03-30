<script setup lang="ts">
import type { AuthSchemaErrorsType, AuthSchemaKeys, AuthSchemaType } from '@/schemas/auth'
import { AuthSchema } from '@/schemas/auth'
import signIn from '@/services/auth/auth.sign-in'
import signUp from '@/services/auth/auth.sign-up'

const props = defineProps({
	signUp: Boolean,
	title: String,
	submitLabel: String,
})

const isLoading = ref(false)

const formErrors = ref<AuthSchemaErrorsType>(null)
const formData = ref<AuthSchemaType>({
	email: '',
	password: '',
	newsletter: false,
})

const hasFormErrors = computed(() => {
	if (!formErrors?.value) {
		return false
	}

	// Check if there are errors in any key
	return Object.keys(formData.value).some((key) => {
		return formErrors?.value?.[key as AuthSchemaKeys]?._errors?.length
	})
})

const shouldRevealPassword = ref(false)
function onRevealPasswordCheckboxChange(event: Event) {
	const isChecked = (event?.target as HTMLInputElement)?.checked
	shouldRevealPassword.value = isChecked
}

function onNewsletterCheckboxChange(event: Event) {
	const isChecked = (event?.target as HTMLInputElement)?.checked
	formData.value.newsletter = isChecked
}

async function handleSignUp() {
	const { error } = await signUp(formData.value)

	if (error?.message === 'User already registered') {
		formErrors.value = Object.assign({}, formErrors.value);
		(formErrors.value as AuthSchemaErrorsType)!.email = {
			_errors: [error.message],
		}
	}

	if (error) {
		throw new Error(error.message)
	}
}

async function handleSignIn() {
	// Exclude newsletter field
	const payload = {
		email: formData.value.email,
		password: formData.value.password,
	}

	const { error } = await signIn(payload)

	if (error?.message === 'Invalid login credentials') {
		formErrors.value = Object.assign({}, formErrors.value);
		(formErrors.value as AuthSchemaErrorsType)!.password = {
			_errors: [error.message],
		}
	}

	if (error) {
		throw new Error(error.message)
	}

	navigateTo('/')
}

async function handleSubmit() {
	isLoading.value = true

	// Client Side validation - Do not do API calls if there are form errors
	const schemaValidation = AuthSchema.safeParse(formData.value)
	if (!schemaValidation.success) {
		formErrors.value = schemaValidation?.error?.format()
		isLoading.value = false
		return
	}

	// API Calls — Sign Up or Sign In
	try {
		if (props.signUp) {
			await handleSignUp()
		}

		return await handleSignIn()
	} catch (error) {
		// Server Side valition - errors should trigger an alert
		if (error instanceof Error && !hasFormErrors.value) {
			alert(error.message)
		}
	} finally {
		isLoading.value = false
	}
}
</script>

<template>
	<main class="n-stack-horizontal h-full flex-1">
		<nord-stack class="stack" direction="vertical" align-items="stretch">
			<nord-card padding="l">
				<div slot="header">
					{{ title }}
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
						<div class="relative">
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
							<NuxtLink
								v-if="!props.signUp"
								to="/forgot-password"
								class="absolute end-0 top-0 text-xs leading-6 plain-link"
							>
								Forgot password?
							</NuxtLink>
						</div>

						<template v-if="props.signUp">
							<nord-divider />
							<nord-checkbox
								v-model="formData.newsletter"
								label="I want to occasionally receive product updates and announcements."
								class="mt-2"
								size="s"
								@change="onNewsletterCheckboxChange"
							/>
						</template>

						<nord-button type="submit" expand variant="primary" size="m" :disabled="isLoading">
							{{ isLoading ? 'Loading' : submitLabel }}
						</nord-button>
					</nord-stack>
				</form>
			</nord-card>

			<nord-card class="n-align-center" padding="m">
				<slot name="actions" />
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
