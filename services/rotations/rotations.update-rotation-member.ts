import type { Database } from '@/types/supabase'
import { useSupabaseClient } from '#imports'

interface UpdateRotationMemberPayload {
	id: string
	reviewer_profile_id: string
}

interface UpdateRotationMemberResponse {
	success: boolean
	error: Error | null
}

/**
 * Update a rotation assignment's reviewer
 * @param payload The payload containing the assignment ID and new reviewer profile ID
 * @returns Success status and error if any
 */
export async function updateRotationMember(
	payload: UpdateRotationMemberPayload,
): Promise<UpdateRotationMemberResponse> {
	const supabase = useSupabaseClient<Database>()

	try {
		const { error } = await supabase
			.from('rotation_assignments')
			.update({
				reviewer_profile_id: payload.reviewer_profile_id,
			})
			.eq('id', payload.id)

		if (error) {
			throw error
		}

		return {
			success: true,
			error: null,
		}
	} catch (error) {
		console.error('Error updating rotation member:', error)
		return {
			success: false,
			error: error instanceof Error ? error : new Error('Failed to update rotation member'),
		}
	}
}
