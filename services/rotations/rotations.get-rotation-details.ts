import type { Database } from '@/types/supabase'
import type { Rotation, RotationMember } from './rotations.get-by-project'
import { useSupabaseClient } from '#imports'

interface RotationDetails {
	rotation: Rotation | null
	members: RotationMember[]
	assignees: { id: string, name: string }[]
	reviewers: { id: string, name: string }[]
}

interface GetRotationDetailsResponse {
	data: RotationDetails | null
	error: Error | null
}

/**
 * Get detailed information about a specific rotation
 * @param rotationId The rotation ID
 * @returns Rotation details and error if any
 */
export async function getRotationDetails(rotationId: string): Promise<GetRotationDetailsResponse> {
	const supabase = useSupabaseClient<Database>()

	try {
		// Get the rotation
		const { data: rotation, error: rotationError } = await supabase
			.from('rotations')
			.select('*')
			.eq('id', rotationId)
			.single()

		if (rotationError) {
			throw rotationError
		}

		if (!rotation) {
			throw new Error('Rotation not found')
		}

		// Get rotation assignments
		const { data: assignments, error: assignmentsError } = await supabase
			.from('rotation_assignments')
			.select('id, rotation_id, assignee_profile_id, reviewer_profile_id')
			.eq('rotation_id', rotationId)

		if (assignmentsError) {
			throw assignmentsError
		}

		// Get profile information for all involved profiles
		const profileIds = [
			...new Set([
				...assignments.map(a => a.assignee_profile_id),
				...assignments.map(a => a.reviewer_profile_id),
			]),
		].filter(Boolean)

		if (profileIds.length > 0) {
			const { data: profiles, error: profilesError } = await supabase
				.from('profiles')
				.select('id, name')
				.in('id', profileIds)

			if (profilesError) {
				throw profilesError
			}

			// Map profile names to assignments
			const membersWithNames = assignments.map((assignment) => {
				const assignee = profiles.find(p => p.id === assignment.assignee_profile_id)
				const reviewer = profiles.find(p => p.id === assignment.reviewer_profile_id)

				return {
					...assignment,
					assignee_name: assignee?.name || 'Unknown',
					reviewer_name: reviewer?.name || 'Unknown',
				}
			})

			// Get unique assignees and reviewers
			const uniqueAssignees = [...new Map(
				profiles
					.filter(p => assignments.some(a => a.assignee_profile_id === p.id))
					.map(p => [p.id, { id: p.id, name: p.name }]),
			).values()]

			const uniqueReviewers = [...new Map(
				profiles
					.filter(p => assignments.some(a => a.reviewer_profile_id === p.id))
					.map(p => [p.id, { id: p.id, name: p.name }]),
			).values()]

			return {
				data: {
					rotation: rotation as Rotation,
					members: membersWithNames as RotationMember[],
					assignees: uniqueAssignees,
					reviewers: uniqueReviewers,
				},
				error: null,
			}
		}

		// No assignments
		return {
			data: {
				rotation: rotation as Rotation,
				members: [],
				assignees: [],
				reviewers: [],
			},
			error: null,
		}
	} catch (error) {
		console.error('Error fetching rotation details:', error)
		return {
			data: null,
			error: error instanceof Error ? error : new Error('Failed to fetch rotation details'),
		}
	}
}
