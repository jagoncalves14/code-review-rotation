import type { Mock } from 'vitest'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { describe, expect, it, vi } from 'vitest'
import getAccessToken from './getAccessToken'

vi.mock('vue-router')

describe('getAccessToken', () => {
	it('should return the access token from the hash', () => {
		(useRoute as Mock).mockReturnValue({
			hash: '#access_token=myAccessToken&token_type=bearer',
		} as RouteLocationNormalizedLoaded)

		const result = getAccessToken()

		expect(result).toEqual('myAccessToken')
	})

	it('should return undefined if the hash does not contain an access token', () => {
		(useRoute as Mock).mockReturnValue({
			hash: '#other_param=value',
		} as RouteLocationNormalizedLoaded)

		const result = getAccessToken()

		expect(result).toBeUndefined()
	})

	it('should return undefined if the hash is empty', () => {
		(useRoute as Mock).mockReturnValue({
			hash: '',
		} as RouteLocationNormalizedLoaded)

		const result = getAccessToken()

		expect(result).toBeUndefined()
	})

	it('should handle multiple key-value pairs in the hash', () => {
		(useRoute as Mock).mockReturnValue({
			hash: '#access_token=myAccessToken&expires_in=3600&token_type=bearer',
		} as RouteLocationNormalizedLoaded)

		const result = getAccessToken()

		expect(result).toEqual('myAccessToken')
	})

	it('should handle the case when the hash is undefined', () => {
		(useRoute as Mock).mockReturnValue({} as RouteLocationNormalizedLoaded)

		const result = getAccessToken()

		expect(result).toBeUndefined()
	})
})
