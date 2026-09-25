type AccessToken = string | undefined

// Collect the access token from the URL hash.
export default function getAccessToken(): AccessToken {
	const route = useRoute()
	const hashDictionary = {} as Record<string, string | undefined>

	// First remove the actual '#' character
	const hash = route?.hash?.replace('#', '')

	// Split hash into key-value pairs
	hash?.split('&')?.forEach((item) => {
		// Split 'key=value' into [key, value]
		const [key, value] = item.split('=')
		// Add to results
		Object.assign(hashDictionary, { [key]: value })
	})

	return hashDictionary.access_token
}
