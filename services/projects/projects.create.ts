import type { ProjectSchemaType } from '@/schemas/project'
import type { Database } from '@/types/supabase'
import { useSupabaseClient, useSupabaseUser } from '#imports'

interface CreateProjectResponse {
	data: {
		id: string
	} | null
	error: Error | null
}

export default async function createProject(payload: ProjectSchemaType): Promise<CreateProjectResponse> {
	const supabase = useSupabaseClient<Database>()
	const user = useSupabaseUser()

	if (!user.value) {
		return { data: null, error: new Error('Not authenticated') }
	}

	try {
		// Create the project
		const { data, error } = await supabase
			.from('projects')
			.insert({
				name: payload.name,
				description: payload.description || null,
				rotation_period_days: payload.rotation_period_days,
				rotation_start_day: payload.rotation_start_day,
				created_by: user.value.id,
				reviewers_count: payload.reviewers_count,
				state: payload.state,
			})
			.select('id')
			.single()

		if (error) {
			return { data: null, error: new Error(error.message) }
		}

		// Once project is created, we can add assignees and reviewers
		if (data) {
			// Add project members (assignees and reviewers)
			const assigneePromises = payload.assignee_ids.map(async (assigneeId) => {
				return supabase.from('project_members').insert({
					project_id: data.id,
					profile_id: assigneeId,
					role: 'assignee',
				})
			})

			const reviewerPromises = payload.reviewer_ids.map(async (reviewerId) => {
				return supabase.from('project_members').insert({
					project_id: data.id,
					profile_id: reviewerId,
					role: 'reviewer',
				})
			})

			// Execute all promises
			await Promise.all([...assigneePromises, ...reviewerPromises])

			return { data, error: null }
		}

		return { data: null, error: new Error('Failed to create project') }
	} catch (error) {
		return {
			data: null,
			error: error instanceof Error ? error : new Error('An unexpected error occurred'),
		}
	}
}
