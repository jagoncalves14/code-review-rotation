import type { Database, ProjectState } from '@/types/supabase'
import { useSupabaseClient } from '#imports'

interface UpdateProjectPayload {
	id: string
	name: string
	rotation_period_days: number
	rotation_start_day: string
	reviewers_count: number
	state: ProjectState
	description?: string | null
	assignee_ids: string[]
	reviewer_ids: string[]
}

interface UpdateProjectResponse {
	data: { id: string } | null
	error: Error | null
}

/**
 * Update an existing project
 * @param payload Project data to update
 * @returns Updated project ID and error if any
 */
export default async function updateProject(payload: UpdateProjectPayload): Promise<UpdateProjectResponse> {
	const supabase = useSupabaseClient<Database>()

	try {
		// Start a transaction to update project and handle members
		// First, update the project details
		const { data, error } = await supabase
			.from('projects')
			.update({
				name: payload.name,
				rotation_period_days: payload.rotation_period_days,
				rotation_start_day: payload.rotation_start_day,
				reviewers_count: payload.reviewers_count,
				state: payload.state,
				description: payload.description || null,
				updated_at: new Date().toISOString(),
			})
			.eq('id', payload.id)
			.select('id')
			.single()

		if (error) {
			throw error
		}

		if (!data) {
			throw new Error('Project not found or could not be updated')
		}

		// Delete existing project members
		const { error: deleteError } = await supabase
			.from('project_members')
			.delete()
			.eq('project_id', payload.id)

		if (deleteError) {
			throw deleteError
		}

		// Add assignees
		const assigneePromises = payload.assignee_ids.map((profileId) => {
			return supabase
				.from('project_members')
				.insert({
					project_id: data.id,
					profile_id: profileId,
					role: 'assignee',
				})
		})

		// Add reviewers
		const reviewerPromises = payload.reviewer_ids.map((profileId) => {
			return supabase
				.from('project_members')
				.insert({
					project_id: data.id,
					profile_id: profileId,
					role: 'reviewer',
				})
		})

		// Execute all promises to add team members
		await Promise.all([...assigneePromises, ...reviewerPromises])

		return {
			data,
			error: null,
		}
	} catch (error) {
		return {
			data: null,
			error: error instanceof Error ? error : new Error('Failed to update project'),
		}
	}
}
