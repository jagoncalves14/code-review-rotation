import { useSupabaseClient } from '#imports'

// Define the types for the database schema
interface Database {
	public: {
		Tables: {
			profiles: {
				Row: {
					id: string
					name: string
					user_id: string | null
					created_at: string
					updated_at: string
				}
				Insert: {
					name: string
					user_id?: string | null
				}
			}
		}
	}
}

interface ProfileInput {
	name: string
	userId?: string
}

/**
 * Creates a new profile in the database
 * @param profile Profile data to create
 * @returns Created profile data or error
 */
export async function createProfile(profile: ProfileInput) {
	const supabase = useSupabaseClient<Database>()

	const { data, error } = await supabase
		.from('profiles')
		.insert({
			name: profile.name,
			user_id: profile.userId || null,
		})
		.select('*')
		.single()

	return {
		data,
		error,
	}
}

export default createProfile
