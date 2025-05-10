import type { ProjectSchemaType } from '@/schemas/project'
import type { Database } from '@/types/supabase'
import { useSupabaseClient, useSupabaseUser } from '#imports'

interface CreateProjectResponse {
	success: boolean
	projectId?: string
	error?: string
}

export default async function createProject(payload: ProjectSchemaType): Promise<CreateProjectResponse> {
	const supabase = useSupabaseClient<Database>()
	const user = useSupabaseUser()

	if (!user.value) {
		return { success: false, error: 'Not authenticated' }
	}

	try {
		// Create the initial project
		const { data: project, error: projectError } = await supabase
			.from('projects')
			.insert({
				name: payload.name,
				description: payload.description || null,
				rotation_period_days: payload.rotationPeriodDays,
				rotation_start_day: payload.startDate,
				created_by: user.value.id,
				reviewers_count: payload.reviewers?.length || 0,
				state: 'active',
			})
			.select('id')
			.single()

		if (projectError) {
			return { success: false, error: projectError.message }
		}
		if (!project) {
			return { success: false, error: 'Failed to create project' }
		}

		// Create the first rotation with assignees and reviewers
		const { data: rotation, error: rotationError } = await supabase
			.from('rotations')
			.insert({
				project_id: project.id,
				start_date: payload.startDate,
				end_date: new Date(new Date(payload.startDate).getTime() + (payload.rotationPeriodDays * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
				assignees: payload.assignees || [],
				reviewers: payload.reviewers || [],
			})
			.select('id')
			.single()

		if (rotationError) {
			return { success: false, error: rotationError.message }
		}
		if (!rotation) {
			return { success: false, error: 'Failed to create rotation' }
		}

		return {
			success: true,
			projectId: project.id,
		}
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'An unexpected error occurred',
		}
	}
}
