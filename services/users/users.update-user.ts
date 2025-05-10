import type { Database } from '@/types/supabase'
import { useSupabaseClient } from '#imports'

interface UpdateUserPayload {
	id: string
	name: string
	is_admin: boolean
	permission: 'view' | 'edit'
}

interface UpdateUserResponse {
	success: boolean
	error?: string
}

export async function updateUser(payload: UpdateUserPayload): Promise<UpdateUserResponse> {
	const supabase = useSupabaseClient<Database>()

	try {
		// Update user profile
		const { error: profileError } = await supabase
			.from('profiles')
			.update({
				name: payload.name,
				is_admin: payload.is_admin,
			})
			.eq('id', payload.id)

		if (profileError) {
			throw profileError
		}

		// Try to update user permissions, but don't fail if table doesn't exist
		try {
			// Update or insert user permissions
			await supabase
				.from('user_permissions')
				.upsert({
					user_id: payload.id,
					permission_level: payload.permission,
				}, { onConflict: 'user_id' })
		} catch (permissionError) {
			console.warn('Could not update permissions, table might not exist:', permissionError)
			// Continue without updating permissions
		}

		return {
			success: true,
		}
	} catch (error) {
		console.error('Error updating user:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'An unknown error occurred',
		}
	}
}
