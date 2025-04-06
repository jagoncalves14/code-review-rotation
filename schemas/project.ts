import z from 'zod'

export const ProjectSchema = z.object({
	name: z
		.string()
		.min(1, { message: 'Project name is required.' })
		.max(100, { message: 'Project name is too long.' }),
	description: z
		.string()
		.max(500, { message: 'Description is too long.' })
		.optional(),
	rotationPeriodDays: z
		.number()
		.int()
		.min(1, { message: 'Rotation period must be at least 1 day.' })
		.max(365, { message: 'Rotation period cannot exceed 365 days.' }),
	startDate: z
		.string()
		.min(1, { message: 'Start date is required.' }),
	assignees: z
		.array(
			z.string()
				.min(1, { message: 'Assignee name cannot be empty.' })
				.max(100, { message: 'Assignee name is too long.' }),
		)
		.min(1, { message: 'At least one assignee role is required.' }),
	reviewers: z
		.array(
			z.string()
				.min(1, { message: 'Reviewer name cannot be empty.' })
				.max(100, { message: 'Reviewer name is too long.' }),
		)
		.min(1, { message: 'At least one reviewer role is required.' }),
})

export type ProjectSchemaType = z.infer<typeof ProjectSchema>
export type ProjectSchemaKeys = keyof ProjectSchemaType
export type ProjectSchemaErrorsType = z.ZodFormattedError<ProjectSchemaType> | null
