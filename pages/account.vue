<script setup lang="ts">
const user = useSupabaseUser()

useHead({
	title: 'Nordhealth DS — Account',
})

const isLoading = ref(false)
const userEmail = ref(user?.value?.email)

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

		alert('Your account has been deleted.')
		navigateTo('/sign-in')
	} catch (error) {
		if (error instanceof Error) {
			alert(error.message)
		}
	} finally {
		isLoading.value = false
	}
}
</script>

<template>
	<main class="n-stack-horizontal mx-auto h-full w-full max-w-screen-md">
		<nord-card class="md:my-10" padding="l">
			<nord-stack class="stack" direction="vertical" align-items="stretch">
				<div class="py-5 md:px-10">
					<h1>Account  ⛄️</h1>
				</div>

				<nord-card gap="l" direction="vertical" padding="l" class="pb-10 md:px-10">
					<div slot="header">Details</div>
					<nord-stack gap="l" direction="vertical" align-items="stretch">
						<p class="n-color-text-weaker">Check your account details here.</p>
						<nord-stack gap="m" direction="vertical" align-items="stretch">
							<nord-input
								:value="userEmail"
								class="inline-block"
								label="Email"
								expand readonly
								name="email"
								autocomplete="email"
								type="email"
								size="m"
							/>

							<div class="py-5">
								<nord-divider />
							</div>

							<nord-stack class="stack" direction="vertical" align-items="stretch">
								<h3 slot="header">Delete your account</h3>
								<p class="n-color-text-weaker">If you want to permanently delete this account and all of its data, click the button below.</p>
								<nord-button variant="danger" type="submit" size="m" @click="handleDeleteClick">Delete account</nord-button>
							</nord-stack>
						</nord-stack>
					</nord-stack>
				</nord-card>
			</nord-stack>
		</nord-card>
	</main>
</template>
