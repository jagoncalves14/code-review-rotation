import type { LocalAuthUser } from '@/utils/local-dev-store'
import { localUser } from '@/utils/local-dev-store'
import { shallowRef } from 'vue'

const user = shallowRef<LocalAuthUser | null>(localUser())

export function useSupabaseUser() {
	return user
}

export function setSupabaseUser(nextUser: LocalAuthUser | null) {
	user.value = nextUser
}
