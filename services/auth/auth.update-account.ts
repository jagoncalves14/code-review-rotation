import type { AccountSchemaType } from '@/schemas/account'
import type { Database } from '@/types/supabase'
import { useSupabaseClient, useSupabaseUser } from '#imports'

interface UpdateAccountResponse {
	success: boolean
	error?: string
}

interface Profile {
	name: string
}

export default async function updateAccount(payload: AccountSchemaType): Promise<UpdateAccountResponse> {
	const supabase = useSupabaseClient<Database>()
	const user = useSupabaseUser()

	if (!user.value) {
		return { success: false, error: 'Not authenticated' }
	}

	if (payload.currentPassword || payload.newPassword || payload.confirmNewPassword) {
	// Verify current password
		const { error: verifyError } = await supabase.auth.signInWithPassword({
			email: payload.email ?? '',
			password: payload.currentPassword ?? '',
		})

		if (verifyError) {
			return { success: false, error: 'Current password is incorrect' }
		}

		// Update email if changed
		if (payload.email !== user.value.email) {
			const { error: updateEmailError } = await supabase.auth.updateUser({
				email: payload.email,
			})

			if (updateEmailError) {
				if (updateEmailError.message.includes('already registered')) {
					return { success: false, error: 'Email already in use' }
				}
				return { success: false, error: updateEmailError.message }
			}
		}

		// Update password if provided
		if (payload.newPassword) {
			const { error: updatePasswordError } = await supabase.auth.updateUser({
				password: payload.newPassword,
			})

			if (updatePasswordError) {
				return { success: false, error: updatePasswordError.message }
			}
		}
	}

	// Update name in profiles table
	const { error: updateProfileError } = await supabase
		.from('profiles')
		.update({ name: payload.name } as Profile)
		.eq('id', user.value.id)

	if (updateProfileError) {
		return { success: false, error: updateProfileError.message }
	}

	return { success: true }
}
