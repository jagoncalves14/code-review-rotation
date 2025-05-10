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

	const { data, error } = await supabase
		.from('profiles')
		.select('name')
		.eq('id', user.value.id)
		.single()

	return {
		data: data as Profile | null,
		error: error ? new Error(error.message) : null,
	}
}
