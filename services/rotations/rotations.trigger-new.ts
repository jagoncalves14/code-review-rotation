import type { Database } from '@/types/supabase'
import { useSupabaseClient } from '#imports'

interface TriggerNewRotationResponse {
	success: boolean
	rotationId?: string
	error: Error | null
}

/**
 * Trigger a new rotation for a project
 * This will set up a new rotation period with assignments based on project settings
 * @param projectId The project ID to create a new rotation for
 * @returns Success status, new rotation ID if created, and error if any
 */
export async function triggerNewRotation(projectId: string): Promise<TriggerNewRotationResponse> {
	const supabase = useSupabaseClient<Database>()

	try {
		// Get project details to determine rotation settings
		const { data: project, error: projectError } = await supabase
			.from('projects')
			.select('*')
			.eq('id', projectId)
			.single()

		if (projectError) {
			throw projectError
		}

		// Get all assignees and reviewers for the project
		const { data: members, error: membersError } = await supabase
			.from('project_members')
			.select('profile_id, role')
			.eq('project_id', projectId)

		if (membersError) {
			throw membersError
		}

		// Extract assignees and reviewers
		const assigneeIds = members
			.filter(member => member.role === 'assignee')
			.map(member => member.profile_id)

		const reviewerIds = members
			.filter(member => member.role === 'reviewer')
			.map(member => member.profile_id)

		if (assigneeIds.length === 0) {
			throw new Error('Project has no assignees')
		}

		if (reviewerIds.length === 0) {
			throw new Error('Project has no reviewers')
		}

		// Calculate rotation dates
		const today = new Date()
		const startDate = today.toISOString().split('T')[0] // YYYY-MM-DD

		const endDate = new Date(today)
		endDate.setDate(today.getDate() + project.rotation_period_days)
		const endDateStr = endDate.toISOString().split('T')[0] // YYYY-MM-DD

		// Create a new rotation
		const { data: newRotation, error: rotationError } = await supabase
			.from('rotations')
			.insert({
				project_id: projectId,
				start_date: startDate,
				end_date: endDateStr,
				manually_triggered: true,
				is_final: false,
			})
			.select('id')
			.single()

		if (rotationError) {
			throw rotationError
		}

		// Create rotation assignments
		// For each assignee, assign reviewers_count random reviewers
		const assignments = []

		for (const assigneeId of assigneeIds) {
			// Get available reviewers (excluding the assignee if they're also a reviewer)
			const availableReviewers = reviewerIds.filter(id => id !== assigneeId)

			if (availableReviewers.length === 0) {
				continue // Skip if no available reviewers
			}

			// Determine how many reviewers to assign (minimum of available reviewers or project setting)
			const reviewersToAssign = Math.min(availableReviewers.length, project.reviewers_count)

			// Shuffle available reviewers to randomize assignments
			const shuffledReviewers = [...availableReviewers].sort(() => Math.random() - 0.5)

			// Create assignments for this assignee
			for (let i = 0; i < reviewersToAssign; i++) {
				assignments.push({
					rotation_id: newRotation.id,
					assignee_profile_id: assigneeId,
					reviewer_profile_id: shuffledReviewers[i],
				})
			}
		}

		// Insert all assignments
		const { error: assignmentsError } = await supabase
			.from('rotation_assignments')
			.insert(assignments)

		if (assignmentsError) {
			throw assignmentsError
		}

		return {
			success: true,
			rotationId: newRotation.id,
			error: null,
		}
	} catch (error) {
		console.error('Error triggering new rotation:', error)
		return {
			success: false,
			error: error instanceof Error ? error : new Error('Failed to trigger new rotation'),
		}
	}
}
