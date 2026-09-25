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
	rotation_period_days: z
		.number()
		.int()
		.min(1, { message: 'Rotation period must be at least 1 day.' })
		.max(365, { message: 'Rotation period cannot exceed 365 days.' }),
	rotation_start_day: z
		.string()
		.min(1, { message: 'Start date is required.' }),
	reviewers_count: z
		.number()
		.int()
		.min(1, { message: 'Number of reviewers must be at least 1.' })
		.max(10, { message: 'Number of reviewers cannot exceed 10.' }),
	assignee_ids: z
		.array(
			z.string()
				.min(1, { message: 'Assignee ID cannot be empty.' }),
		)
		.min(1, { message: 'At least one assignee is required.' }),
	reviewer_ids: z
		.array(
			z.string()
				.min(1, { message: 'Reviewer ID cannot be empty.' }),
		)
		.min(1, { message: 'At least one reviewer is required.' }),
	state: z
		.enum(['draft', 'active', 'inactive'])
		.default('draft'),
})

export type ProjectSchemaType = z.infer<typeof ProjectSchema>
export type ProjectSchemaKeys = keyof ProjectSchemaType
export type ProjectSchemaErrorsType = z.ZodFormattedError<ProjectSchemaType> | null
