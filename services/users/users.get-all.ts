import type { Database } from '@/types/supabase'
import { useSupabaseClient } from '#imports'

interface User {
	id: string
	name: string
	email: string
}

interface GetUsersResponse {
	data: User[] | null
	error: Error | null
}

export default async function getAllUsers(): Promise<GetUsersResponse> {
	const supabase = useSupabaseClient<Database>()

	const { data, error } = await supabase
		.from('profiles')
		.select('id, name, email')
		.order('name')

	return {
		data: data as User[] | null,
		error: error ? new Error(error.message) : null,
	}
}
