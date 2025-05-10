// @ts-nocheck - Type mismatch between BaseCombobox and our schema
<script setup lang="ts">
import type { ProjectSchemaErrorsType, ProjectSchemaType } from '@/schemas/project'
import type { Option } from '~/components/BaseCombobox.vue'
import { ProjectSchema } from '@/schemas/project'
import createProject from '@/services/projects/projects.create'
import BaseCombobox from '~/components/BaseCombobox.vue'

definePageMeta({
	title: 'Nordhealth DS — Create Project',
})

const addToast = useAddToast()
const router = useRouter()
const isLoading = ref(false)
const formErrors = ref<ProjectSchemaErrorsType>(null)

// Get today's date in YYYY-MM-DD format
const today = new Date().toISOString().split('T')[0]

// Get the most recent Sunday (if today is Monday, it will be yesterday)
// If today is Sunday, use today's date
function getMostRecentSunday(d = new Date()) {
	const today = new Date(d)
	const day = today.getDay() // 0 = Sunday, 1 = Monday, etc.

	// If today is Sunday, return today's date
	if (day === 0) {
		return today.toISOString().split('T')[0]
	}

	// Otherwise, move back to the most recent Sunday
	const date = new Date(today)
	date.setDate(date.getDate() - day)
	return date.toISOString().split('T')[0]
}

const minDate = getMostRecentSunday()

const formData = ref<ProjectSchemaType>({
	name: '',
	description: '',
	rotationPeriodDays: 14,
	startDate: today,
	assignees: [],
	reviewers: [],
})

// Shared options for both comboboxes
const sharedOptions = ref<Option[]>([])
const assigneesOptions = computed(() => {
	return sharedOptions.value.filter(option => formData.value.reviewers.includes(String(option.value)))
})

const reviewersOptions = computed(() => {
	return sharedOptions.value.filter(option => formData.value.assignees.includes(String(option.value)))
})

// Update shared options when either field changes
const currentOptions = computed(() => [...new Set([...formData.value.assignees, ...formData.value.reviewers])])
function onComboboxFocus() {
	// Filter out empty values, convert to strings, trim whitespace, and remove duplicates
	const allOptions = [...new Set(
		currentOptions.value
			.filter(Boolean)
			.map(value => String(value).trim()),
	)]

	sharedOptions.value = allOptions.map(option => ({
		value: option,
		label: option,
	}))
}

// Add handler for date change
function onDateChange(event: Event) {
	const target = event.target as HTMLInputElement
	formData.value.startDate = target.value
}

async function handleSubmit() {
	isLoading.value = true
	formErrors.value = null

	// Client Side validation
	const schemaValidation = ProjectSchema.safeParse(formData.value)
	if (!schemaValidation.success) {
		formErrors.value = schemaValidation.error.format()
		isLoading.value = false
		return
	}

	try {
		const result = await createProject(formData.value)

		if (result.success && result.projectId) {
			// Navigate to the project page
			router.push(`/projects/${result.projectId}`)
		} else {
			addToast(result.error || 'Failed to create project', { variant: 'danger' })
		}
	} catch (error) {
		if (error instanceof Error) {
			addToast(error.message, { variant: 'danger' })
		}
	} finally {
		isLoading.value = false
	}
}
</script>

<template>
	<main class="n-stack-horizontal mx-auto h-full w-full max-w-screen-md">
		<nord-card class="md:my-10" padding="l">
			<nord-stack class="stack" direction="vertical" align-items="stretch">
				<div class="py-5 md:px-10">
					<h1>Create Project</h1>
				</div>

				<nord-card gap="l" direction="vertical" padding="l" class="pb-10 md:px-10">
					<div slot="header">Project Details</div>
					<nord-stack gap="l" direction="vertical" align-items="stretch">
						<p class="n-color-text-weaker">Create a new project to manage rotations.</p>

						<!-- Project Creation Form -->
						<form @submit.prevent="handleSubmit">
							<nord-stack gap="m" direction="vertical" align-items="stretch">
								<!-- Project Name -->
								<nord-input
									v-model="formData.name"
									label="Project Name"
									expand
									required
									hide-required
									name="name"
									placeholder="Enter project name"
									size="m"
									:error="formErrors?.name?._errors"
								/>

								<!-- Project Description -->
								<nord-textarea
									v-model="formData.description"
									label="Description"
									expand
									name="description"
									placeholder="Enter project description"
									size="m"
									:error="formErrors?.description?._errors"
								/>

								<!-- Rotation Period -->
								<nord-input
									v-model.number="formData.rotationPeriodDays"
									label="Rotation Period (days)"
									expand
									required
									hide-required
									name="rotationPeriodDays"
									type="number"
									min="1"
									max="365"
									disallow-pattern="[^0-9]"
									placeholder="Enter rotation period in days"
									size="m"
									:error="formErrors?.rotationPeriodDays?._errors"
								/>

								<!-- Start Date -->
								<nord-date-picker
									v-model="formData.startDate"
									label="Start Date"
									expand
									required
									hide-required
									name="startDate"
									size="m"
									:min="minDate"
									:error="formErrors?.startDate?._errors"
									@change="onDateChange"
								/>

								<!-- Assignees -->
								<BaseCombobox
									v-model="formData.assignees"
									label="Assignees"
									placeholder="Add assignee"
									:error="formErrors?.assignees?._errors?.[0]"
									:options="assigneesOptions"
									:value-as-object="false"
									multiple
									create-option
									expand
									@focus="onComboboxFocus"
								/>

								<!-- Reviewers -->
								<BaseCombobox
									v-model="formData.reviewers"
									label="Reviewers"
									placeholder="Add reviewer"
									:error="formErrors?.reviewers?._errors?.[0]"
									:options="reviewersOptions"
									:value-as-object="false"
									multiple
									create-option
									expand
									@focus="onComboboxFocus"
								/>

								<!-- Submit Button -->
								<nord-button
									type="submit"
									expand
									variant="primary"
									size="m"
									:disabled="isLoading"
								>
									{{ isLoading ? 'Creating...' : 'Create Project' }}
								</nord-button>
							</nord-stack>
						</form>
					</nord-stack>
				</nord-card>
			</nord-stack>
		</nord-card>
	</main>
</template>
