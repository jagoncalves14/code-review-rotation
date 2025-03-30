export default async function resetPassword(accessToken: any) {
	const supabase = useSupabaseClient()

	const { data, error } = await supabase.auth.updateUser(accessToken)
	return { data, error }
}
