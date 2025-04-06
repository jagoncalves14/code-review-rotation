import type { ProjectSchemaType } from '@/schemas/project'
import type { Database } from '@/types/supabase'
import { useSupabaseClient, useSupabaseUser } from '#imports'

interface CreateProjectResponse {
	success: boolean
	error?: string
	projectId?: string
}

export default async function createProject(payload: ProjectSchemaType): Promise<CreateProjectResponse> {
	const supabase = useSupabaseClient<Database>()
	const user = useSupabaseUser()

	if (!user.value) {
		return { success: false, error: 'Not authenticated' }
	}

	// Create the project
	const { data: project, error: projectError } = await supabase
		.from('projects')
		.insert({
			name: payload.name,
			description: payload.description || null,
			rotation_period_days: payload.rotationPeriodDays,
			start_date: payload.startDate,
			created_by: user.value.id,
			assignee_roles: payload.assignees,
			reviewer_roles: payload.reviewers,
		})
		.select('id')
		.single()

	if (projectError) {
		return { success: false, error: projectError.message }
	}

	// Add the creator as a project member with admin role
	const { error: memberError } = await supabase
		.from('project_members')
		.insert({
			project_id: project.id,
			user_id: user.value.id,
			role: 'admin',
		})

	if (memberError) {
		// If adding member fails, we should delete the project
		await supabase
			.from('projects')
			.delete()
			.eq('id', project.id)

		return { success: false, error: memberError.message }
	}

	return {
		success: true,
		projectId: project.id,
	}
}
