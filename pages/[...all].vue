<script setup>
useHead({
	title: 'Nordhealth DS — 404 Not found',
})
</script>

<template>
	<main class="n-stack-horizontal mx-auto h-full w-full max-w-screen-md">
		<nord-card class="md:my-10" padding="l">
			<nord-stack class="stack" direction="vertical" align-items="stretch">
				<div class="py-5 md:px-10">
					<h1>404 — Page not found 🗺️</h1>
					<p class="mt-2 text-base">It looks like that page doesn't exist. Please check the URL and try again.</p>
					<NuxtLink to="/">
						<nord-button class="mt-8" variant="primary">
							Go home
						</nord-button>
					</NuxtLink>
				</div>
			</nord-stack>
		</nord-card>
	</main>
</template>
