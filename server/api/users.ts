import type { Database } from '@/types/supabase'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

interface _Profile {
	id: string
	name: string
	is_admin: boolean
}

export default defineEventHandler(async (event) => {
	// Get the authenticated user
	const user = await serverSupabaseUser(event)
	if (!user) {
		throw createError({
			statusCode: 401,
			message: 'Unauthorized',
		})
	}

	const supabase = await serverSupabaseClient<Database>(event)

	// Check if user is admin
	const { data: profile } = await supabase
		.from('profiles')
		.select('is_admin')
		.eq('id', user.id)
		.single()

	if (!profile?.is_admin) {
		throw createError({
			statusCode: 403,
			message: 'Forbidden - Admin access required',
		})
	}

	// Get query parameters
	const query = getQuery(event)
	const page = Number.parseInt(query.page as string) || 1
	const pageSize = Number.parseInt(query.pageSize as string) || 10
	const searchQuery = query.search as string || ''

	const from = (page - 1) * pageSize
	const to = from + pageSize - 1

	// Get profiles with pagination
	let profilesQuery = supabase
		.from('profiles')
		.select('id, name, is_admin', { count: 'exact' })

	if (searchQuery && searchQuery.trim() !== '') {
		profilesQuery = profilesQuery.ilike('name', `%${searchQuery}%`)
	}

	const { data: profiles, error: profilesError, count } = await profilesQuery
		.order('name')
		.range(from, to)

	if (profilesError) {
		throw createError({
			statusCode: 500,
			message: profilesError.message,
		})
	}

	// For now, we'll create demo emails since we can't access auth.users directly
	// In a production environment, you would need to use a service role key or
	// create a database view/function that has access to auth.users
	const usersWithEmail = (profiles || []).map((profile) => {
		// Generate a simple demo email based on the user ID
		// This is just a placeholder - in production, you'd need to implement
		// a proper solution to access the real emails
		const emailPrefix = profile.name.toLowerCase().replace(/[^a-z0-9]/g, '')

		return {
			id: profile.id,
			name: profile.name,
			is_admin: profile.is_admin,
			email: `${emailPrefix}@example.com`,
		}
	})

	return {
		users: usersWithEmail,
		count: count || 0,
	}
})
