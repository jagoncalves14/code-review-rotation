import type { Database } from '@/types/supabase'
import { useSupabaseClient, useSupabaseUser } from '#imports'

export default defineNuxtRouteMiddleware(async (_to) => {
	const user = useSupabaseUser()
	const supabase = useSupabaseClient<Database>()

	// If user is not logged in, redirect to sign-in
	if (!user.value) {
		return navigateTo('/sign-in')
	}

	// Check if user is admin
	const { data: profile, error } = await supabase
		.from('profiles')
		.select('is_admin')
		.eq('id', user.value.id)
		.single()

	// If there's an error or user is not admin, redirect to home
	if (error || !profile || !profile.is_admin) {
		// Could show a notification here about insufficient permissions
		return navigateTo('/')
	}
})
