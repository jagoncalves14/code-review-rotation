export default async function forgotPassword(email: string) {
	const supabase = useSupabaseClient()

	const { data, error } = await supabase.auth.resetPasswordForEmail(
		email,
		{
			redirectTo: `/reset-password`,
		},
	)

	return { data, error }
}
