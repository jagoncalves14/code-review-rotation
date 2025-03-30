<script setup>
useHead({
	title: 'Nordhealth DS — Home',
})

const count = ref(0)
</script>

<template>
	<main class="n-stack-horizontal mx-auto h-full w-full max-w-screen-md">
		<nord-card class="md:my-10" padding="l">
			<nord-stack class="stack" direction="vertical" align-items="stretch">
				<div class="py-5 md:px-10">
					<h1>Hello! 👋</h1>
					<p class="mt-8 text-base">
						This is an app experimenting a login flow using components from Nordhealth's Design System.
					</p>

					<div class="py-5">
						<nord-divider />
					</div>

					<p class="text-base">
						Click the button below, and the count will increase.
					</p>
					<nord-button class="mt-4" variant="primary" @click="count++">
						Count is: {{ count }}
					</nord-button>
				</div>
			</nord-stack>
		</nord-card>
	</main>
</template>
