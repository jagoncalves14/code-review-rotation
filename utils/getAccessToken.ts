import type { UserAttributes } from '@supabase/supabase-js'

// Collects the access token from the URL hash
export default function getAccessToken(): UserAttributes {
	const route = useRoute()
	const hashDictionary = {} as Record<string, string | UserAttributes>

	// First remove the actual '#' character
	const hash = route?.hash?.replace('#', '')

	// Split hash into key-value pairs
	hash?.split('&')?.forEach((item) => {
		// Split 'key=value' into [key, value]
		const [key, value] = item.split('=')
		// Add to results
		Object.assign(hashDictionary, { [key]: value })
	})

	return hashDictionary?.access_token as UserAttributes
}
