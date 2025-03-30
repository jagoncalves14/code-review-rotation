<script setup lang="ts">
useHead({
	title: 'Nordhealth DS — Sign up',
})
</script>

<template>
	<AuthForm
		sign-up
		title="Sign up to Nord"
		submit-label="Sign up"
	>
		<template #actions>
			Already have an account? <NuxtLink to="/sign-in" class="plain-link">Sign in</NuxtLink>.
		</template>
	</AuthForm>
</template>

<style scoped lang="scss">
.stack {
	inline-size: 90%;
	max-inline-size: 340px;
	margin: var(--n-space-xl) auto;
}
</style>
