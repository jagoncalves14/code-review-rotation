export default async function signOut() {
	const supabase = useSupabaseClient()

	const { error } = await supabase.auth.signOut()
	return { error }
}
