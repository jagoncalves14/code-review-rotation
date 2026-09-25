import type { Database } from '@/types/supabase'
import { useSupabaseClient } from '#imports'

export interface Rotation {
	id: string
	project_id: string
	start_date: string
	end_date: string
	created_at: string
	manually_triggered: boolean
	is_final: boolean
}

export interface RotationMember {
	id: string
	rotation_id: string
	assignee_profile_id: string
	reviewer_profile_id: string
	assignee_name?: string
	reviewer_name?: string
}

interface GetRotationsResponse {
	rotations: Rotation[]
	activeRotation: Rotation | null
	error: Error | null
}

/**
 * Get rotations for a specific project
 * @param projectId The project ID
 * @returns Rotations data and error if any
 */
export async function getRotationsByProject(projectId: string): Promise<GetRotationsResponse> {
	const supabase = useSupabaseClient<Database>()

	try {
		// Get all rotations for the project
		const { data: rotations, error } = await supabase
			.from('rotations')
			.select('*')
			.eq('project_id', projectId)
			.order('start_date', { ascending: false })

		if (error) {
			throw error
		}

		// Find the active rotation (current date between start_date and end_date)
		const now = new Date().toISOString()
		const activeRotation = rotations.find(rotation =>
			rotation.start_date <= now && rotation.end_date >= now,
		) || null

		return {
			rotations: rotations as Rotation[],
			activeRotation: activeRotation as Rotation | null,
			error: null,
		}
	} catch (error) {
		console.error('Error fetching rotations:', error)
		return {
			rotations: [],
			activeRotation: null,
			error: error instanceof Error ? error : new Error('Failed to fetch rotations'),
		}
	}
}
