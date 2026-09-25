import type { Database } from '@/types/supabase'
import { useSupabaseClient } from '#imports'

interface DeleteProjectResponse {
	success: boolean
	error: Error | null
}

/**
 * Delete a project by ID
 * @param id The project ID to delete
 * @returns Success status and error if any
 */
export default async function deleteProject(id: string): Promise<DeleteProjectResponse> {
	const supabase = useSupabaseClient<Database>()

	try {
		// Supabase will handle cascading deletes for project_members through foreign key constraints
		const { error } = await supabase
			.from('projects')
			.delete()
			.eq('id', id)

		if (error) {
			throw error
		}

		return {
			success: true,
			error: null,
		}
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error : new Error('Failed to delete project'),
		}
	}
}
