import z from 'zod'

export const AccountSchema = z.object({
	name: z
		.string()
		.max(100, { message: 'Name is too long.' })
		.optional(),
	email: z
		.string()
		.email('This is not a valid email.')
		.optional(),
	currentPassword: z
		.string()
		.min(6, { message: 'Password must be at least 6 characters.' })
		.optional(),
	newPassword: z
		.string()
		.min(6, { message: 'Password must be at least 6 characters.' })
		.optional(),
	confirmNewPassword: z
		.string()
		.min(6, { message: 'Password must be at least 6 characters.' })
		.optional(),
}).refine((data) => {
	// If either newPassword or confirmNewPassword is filled, both must be filled
	if (data.newPassword || data.confirmNewPassword) {
		return data.newPassword && data.confirmNewPassword && data.currentPassword
	}
	return true
}, {
	message: 'Current password and both new password fields must be filled.',
	path: ['currentPassword'],
}).refine((data) => {
	// If both are filled, they must match
	if (data.newPassword && data.confirmNewPassword) {
		return data.newPassword === data.confirmNewPassword
	}
	return true
}, {
	message: 'Passwords do not match.',
	path: ['confirmNewPassword'],
}).refine((data) => {
	// If email is being changed, current password is required
	if (data.email) {
		return !!data.currentPassword
	}
	return true
}, {
	message: 'Current password is required to change email.',
	path: ['currentPassword'],
}).refine((data) => {
	// At least one field should be filled
	return !!(data.name || data.email || data.newPassword)
}, {
	message: 'At least one field must be changed.',
	path: ['name'],
})

export type AccountSchemaType = z.infer<typeof AccountSchema>
export type AccountSchemaKeys = keyof AccountSchemaType
export type AccountSchemaErrorsType = z.ZodFormattedError<AccountSchemaType> | null
