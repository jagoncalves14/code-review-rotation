export default async function signUp(payload: { email: string, password: string }) {
	const supabase = useSupabaseClient()

	const { data, error } = await supabase.auth.signUp(payload)

	// Supabase needs a small hack to check whether user already is already registered or not.
	// Enforcing an error message if user already registered.
	// See https://supabase.com/docs/reference/javascript/auth-signup
	let customError = null
	const userAlreadyRegistered = data.user && data.user.identities && data.user.identities.length === 0
	if (userAlreadyRegistered) {
		customError = {
			name: 'AuthApiError',
			message: 'User already registered',
		} as typeof error
	} else if (error) {
		customError = error
	}

	return { data, error: customError }
}
