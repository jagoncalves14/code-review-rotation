import z from 'zod'

// Sign In / Sign Up
export const AuthSchema = z.object({
	email: z
		.string()
		.min(1, { message: 'This field has to be filled.' })
		.email('This is not a valid email.'),
	password: z
		.string()
		.min(6),
	newsletter: z
		.boolean(),
}).required({ email: true, password: true })
export type AuthSchemaType = z.infer<typeof AuthSchema>
export type AuthSchemaKeys = keyof AuthSchemaType
export type AuthSchemaErrorsType = z.ZodFormattedError<AuthSchemaType> | null

// Forgot Password
export const ForgotPasswordSchema = z.object({
	email: z
		.string()
		.min(1, { message: 'This field has to be filled.' })
		.email('This is not a valid email.'),
}).required({ email: true })
export type ForgotPasswordSchemaType = z.infer<typeof ForgotPasswordSchema>
export type ForgotPasswordSchemaKeys = keyof ForgotPasswordSchemaType
export type ForgotPasswordSchemaErrorsType = z.ZodFormattedError<ForgotPasswordSchemaType> | null

// Reset Password
export const ResetPasswordSchema = z.object({
	password: z
		.string()
		.min(6),
}).required({ password: true })
export type ResetPasswordSchemaType = z.infer<typeof ResetPasswordSchema>
export type ResetPasswordSchemaKeys = keyof ResetPasswordSchemaType
export type ResetPasswordSchemaErrorsType = z.ZodFormattedError<ResetPasswordSchemaType> | null
