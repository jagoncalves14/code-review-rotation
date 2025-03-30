export default async function signIn(payload: { email: string, password: string }) {
	const supabase = useSupabaseClient()

	const { data, error } = await supabase.auth.signInWithPassword(payload)
	return { data, error }
}
