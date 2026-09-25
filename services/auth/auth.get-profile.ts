import type { Database } from '@/types/supabase'
import { useSupabaseClient, useSupabaseUser } from '#imports'

type Profile = Database['public']['Tables']['profiles']['Row']

interface GetProfileResponse {
	data: Profile | null
	error: Error | null
}

export default async function getProfile(): Promise<GetProfileResponse> {
	const supabase = useSupabaseClient<Database>()
	const user = useSupabaseUser()

	if (!user.value?.id) {
		return { data: null, error: new Error('User not authenticated') }
	}

	try {
		// First try to get a profile using maybeSingle instead of single
		const { data, error } = await supabase
			.from('profiles')
			.select('id, name, is_admin, created_at, updated_at, user_id')
			.eq('user_id', user.value.id)
			.maybeSingle()

		if (error) {
			throw error
		}

		// If no profile found, try to find by id as a fallback
		if (!data) {
			const { data: dataById, error: errorById } = await supabase
				.from('profiles')
				.select('id, name, is_admin, created_at, updated_at, user_id')
				.eq('id', user.value.id)
				.maybeSingle()

			if (errorById) {
				throw errorById
			}

			return {
				data: dataById as Profile | null,
				error: null,
			}
		}

		return {
			data: data as Profile | null,
			error: null,
		}
	} catch (error) {
		console.error('Error fetching profile:', error)
		return {
			data: null,
			error: error instanceof Error ? error : new Error('Failed to fetch profile'),
		}
	}
}
