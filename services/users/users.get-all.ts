import type { Database } from '@/types/supabase'
import { useSupabaseClient } from '#imports'

interface User {
	id: string
	name: string
	email: string
	is_admin: boolean
}

interface GetUsersResponse {
	data: User[] | null
	error: Error | null
	count: number
}

export default async function getAllUsers(
	page = 1,
	pageSize = 10,
	searchQuery = '',
): Promise<GetUsersResponse> {
	const supabase = useSupabaseClient<Database>()

	try {
		// Fetch all user data using the properly created function
		const { data, error } = await supabase
			.rpc('get_users_with_emails')

		if (error) {
			throw error
		}

		// Handle filtering based on search query
		let filteredData = data || []
		if (searchQuery && searchQuery.trim() !== '') {
			const query = searchQuery.toLowerCase()
			filteredData = filteredData.filter((user: User) =>
				(user.name && user.name.toLowerCase().includes(query))
				|| (user.email && user.email.toLowerCase().includes(query)),
			)
		}

		// Calculate total count for pagination
		const count = filteredData.length

		// Apply pagination manually
		const paginatedData = filteredData.slice((page - 1) * pageSize, page * pageSize)

		return {
			data: paginatedData as User[],
			error: null,
			count,
		}
	} catch (error) {
		console.error('Error fetching users:', error)
		return {
			data: null,
			error: error instanceof Error ? error : new Error('Unknown error occurred'),
			count: 0,
		}
	}
}
