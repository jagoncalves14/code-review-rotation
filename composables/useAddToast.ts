import type { ToastGroup } from '@nordhealth/components'
import type { InjectionKey } from 'vue'

export type AddToast = ToastGroup['addToast']
const addToastKey = Symbol('addToastKey') as InjectionKey<AddToast>

export function provideAddToast(addToast: AddToast) {
	provide(addToastKey, addToast)
}

export function useAddToast() {
	const addToast = inject(addToastKey)

	if (!addToast) {
		throw new Error('No provider found for addToast')
	}

	return addToast
}
