import type { Database } from '@/types/supabase'
import { useSupabaseClient } from '#imports'

interface ProfileData {
	id: string
	name: string
	email: string
	is_admin: boolean
	created_at: string
	updated_at: string
}

interface UserData {
	id: string
	name: string
	email: string
	is_admin: boolean
	permission?: 'view' | 'edit'
}

interface GetUserResponse {
	data: UserData | null
	error: Error | null
}

export async function getUser(userId: string): Promise<GetUserResponse> {
	const supabase = useSupabaseClient<Database>()

	try {
		// Get user profile data
		const { data: profile, error: profileError } = await supabase
			.rpc('get_users_with_emails')
			.eq('id', userId)
			.single()

		if (profileError) {
			throw profileError
		}

		// Get user permissions
		let permissions = null

		try {
			const result = await supabase
				.from('user_permissions')
				.select('permission_level')
				.eq('user_id', userId)
				.maybeSingle()

			console.warn('Permission data from DB:', result)
			permissions = result.data
		} catch (error) {
			console.warn('Error fetching permissions, table might not exist:', error)
			// Continue without permissions data
		}

		// Safely cast profile data
		const typedProfile = profile as ProfileData

		// Build user data object
		const userData: UserData = {
			id: typedProfile.id,
			name: typedProfile.name,
			email: typedProfile.email || '',
			is_admin: typedProfile.is_admin,
			permission: (permissions?.permission_level === 'view' || permissions?.permission_level === 'edit')
				? permissions.permission_level
				: 'view',
		}

		return {
			data: userData,
			error: null,
		}
	} catch (error) {
		console.error('Error fetching user:', error)
		return {
			data: null,
			error: error instanceof Error ? error : new Error('Unknown error occurred'),
		}
	}
}
