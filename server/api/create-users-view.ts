import type { Database } from '@/types/supabase'
import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
	try {
		// This requires the SUPABASE_SERVICE_KEY to be set in your .env
		const supabase = await serverSupabaseServiceRole<Database>(event)

		// Create a view that joins profiles with auth.users
		const { error } = await supabase.rpc('create_users_view')

		if (error) {
			console.error('Error creating view:', error)
			return { success: false, error: error.message }
		}

		return { success: true }
	} catch (error) {
		console.error('Error:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error',
		}
	}
})
