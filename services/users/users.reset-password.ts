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

interface ResetPasswordResponse {
	success: boolean
	error?: string
}

export async function resetPassword(userId: string): Promise<ResetPasswordResponse> {
	const supabase = useSupabaseClient<Database>()

	try {
		// First, we need to get the user's email
		const { data: userData, error: userError } = await supabase
			.rpc('get_users_with_emails')
			.eq('id', userId)
			.single()

		if (userError) {
			throw userError
		}

		// Cast to typed profile
		const typedUserData = userData as ProfileData

		if (!typedUserData || !typedUserData.email) {
			throw new Error('User email not found')
		}

		// Send password reset email to the user
		const { error: resetError } = await supabase.auth.resetPasswordForEmail(
			typedUserData.email,
			{ redirectTo: `${window.location.origin}/reset-password` },
		)

		if (resetError) {
			throw resetError
		}

		return {
			success: true,
		}
	} catch (error) {
		console.error('Error sending password reset:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'An unknown error occurred',
		}
	}
}
