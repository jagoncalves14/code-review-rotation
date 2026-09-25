import type { Database, Project } from '@/types/supabase'
import { useSupabaseClient } from '#imports'

interface GetAllProjectsResponse {
	data: Project[] | null
	error: Error | null
	count: number
}

/**
 * Get all projects with pagination and search
 * @param page Current page number (starts at 1)
 * @param pageSize Number of items per page
 * @param searchQuery Optional search term for project name
 * @returns Projects data, error if any, and total count
 */
export default async function getAllProjects(
	page = 1,
	pageSize = 10,
	searchQuery = '',
): Promise<GetAllProjectsResponse> {
	const supabase = useSupabaseClient<Database>()

	try {
		// Calculate range for pagination
		const from = (page - 1) * pageSize
		const to = from + pageSize - 1

		// Start building the query
		let query = supabase
			.from('projects')
			.select('*', { count: 'exact' })

		// Add search filter if provided
		if (searchQuery) {
			query = query.ilike('name', `%${searchQuery}%`)
		}

		// Execute the query with pagination
		const { data, error, count } = await query
			.order('created_at', { ascending: false })
			.range(from, to)

		if (error) {
			throw error
		}

		return {
			data,
			error: null,
			count: count || 0,
		}
	} catch (error) {
		return {
			data: null,
			error: error instanceof Error ? error : new Error('Failed to fetch projects'),
			count: 0,
		}
	}
}
