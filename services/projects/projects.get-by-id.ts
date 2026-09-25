import type { Database, Project } from '@/types/supabase'
import { useSupabaseClient } from '#imports'

interface GetProjectResponse {
	data: Project | null
	error: Error | null
}

/**
 * Get a project by ID
 * @param id The project ID
 * @returns Project data and error if any
 */
export default async function getProjectById(id: string): Promise<GetProjectResponse> {
	const supabase = useSupabaseClient<Database>()

	try {
		// Fetch the project with basic information
		const { data, error } = await supabase
			.from('projects')
			.select('*')
			.eq('id', id)
			.single()

		if (error) {
			throw error
		}

		// Fetch the project's assignees and reviewers from project_members
		const { data: members, error: membersError } = await supabase
			.from('project_members')
			.select('profile_id, role')
			.eq('project_id', id)

		if (membersError) {
			throw membersError
		}

		// Process project members into assignees and reviewers
		if (data && members) {
			// Add assignee_ids and reviewer_ids to the project data
			const assigneeIds = members
				.filter(member => member.role === 'assignee')
				.map(member => member.profile_id)

			const reviewerIds = members
				.filter(member => member.role === 'reviewer')
				.map(member => member.profile_id)

			// Add these arrays to the project data
			const projectWithMembers = {
				...data,
				assignee_ids: assigneeIds,
				reviewer_ids: reviewerIds,
			}

			return {
				data: projectWithMembers as Project,
				error: null,
			}
		}

		return {
			data: data as Project,
			error: null,
		}
	} catch (error) {
		return {
			data: null,
			error: error instanceof Error ? error : new Error('Failed to fetch project'),
		}
	}
}
