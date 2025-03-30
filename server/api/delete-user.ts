import { serverSupabaseServiceRole } from '#supabase/server'
import { createError } from 'h3'

export default eventHandler(async (event) => {
	const client = serverSupabaseServiceRole(event)
	const body = await readBody(event)
	const { data, error } = await client.auth.admin.deleteUser(body.userId)

	if (error) {
		throw createError({ statusMessage: error.message })
	}

	return data
})
