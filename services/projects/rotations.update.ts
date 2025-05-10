import type { Database } from '@/types/supabase'
import { useSupabaseClient } from '#imports'

interface UpdateRotationPayload {
	rotationId: string
	assignees: string[]
	reviewers: string[]
}

export async function updateRotation(payload: UpdateRotationPayload) {
	const supabase = useSupabaseClient<Database>()

	const { data: rotation, error: updateError } = await supabase
		.from('rotations')
		.update({
			assignees: payload.assignees,
			reviewers: payload.reviewers,
		})
		.eq('id', payload.rotationId)
		.select()
		.single()

	if (updateError) {
		throw updateError
	}

	return rotation
}
