export default defineNuxtRouteMiddleware((to, _from) => {
	const authRoutes = ['/sign-in', '/sign-up', '/forgot-password', '/reset-password']
	if (authRoutes.includes(to.path)) {
		return
	}

	const user = useSupabaseUser()

	if (!user.value && to) {
		return navigateTo('/sign-in')
	}
})
