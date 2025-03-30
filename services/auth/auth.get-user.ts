export default async function getUser() {
	const supabase = useSupabaseClient()

	const { data, error } = await supabase.auth.getUser()
	return { data, error }
}
