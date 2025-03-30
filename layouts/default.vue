<script setup lang="ts">
const user = useSupabaseUser()
const route = useRoute()
const currentRoutePath = computed(() => route.path)
const supabase = useSupabaseClient()

const isLoading = ref(false)
async function handleSignOut() {
	isLoading.value = true

	try {
		const { error } = await supabase.auth.signOut()

		if (error) {
			throw error
		}

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
	<div class="min-h-full flex flex-col">
		<header class="border-gray-200 bg-white px-4 py-2 shadow">
			<div class="mx-auto max-w-screen-xl flex flex-wrap items-center justify-between">
				<div class="flex items-center py-2">
					<NuxtLink to="/" class="block hover:opacity-80">
						<img alt="Nordhealth logo" src="@/assets/nordhealth.svg" width="30" height="30">
					</NuxtLink>
				</div>

				<div v-if="!isLoading && currentRoutePath" class="w-auto flex items-center justify-between">
					<ul class="flex flex-row list-none font-medium space-x-8">
						<template v-if="user">
							<li>
								<NuxtLink
									:class="{
										'plain-link underline': currentRoutePath === '/',
										'text-gray-600 no-underline hover:text-gray-900': currentRoutePath !== '/',
									}"
									class="block py-2 text-sm"
									to="/"
								>
									Home
								</NuxtLink>
							</li>
							<li>
								<NuxtLink
									:class="{
										'plain-link underline': currentRoutePath === '/account',
										'text-gray-600 no-underline hover:text-gray-900': currentRoutePath !== '/account',
									}"
									class="block py-2 text-sm"
									to="/account"
								>
									Account
								</NuxtLink>
							</li>
						</template>
						<li>
							<template v-if="!user">
								<NuxtLink
									v-if="currentRoutePath === '/sign-in'" to="/sign-up" class="text-inherit no-underline"
								>
									<nord-button>
										Sign up
									</nord-button>
								</NuxtLink>
								<NuxtLink v-else to="/sign-in" class="text-inherit no-underline">
									<nord-button>
										Sign in
									</nord-button>
								</NuxtLink>
							</template>
							<nord-button v-else @click="handleSignOut">
								Sign out
							</nord-button>
						</li>
					</ul>
				</div>
			</div>
		</header>
		<slot />
	</div>
</template>
