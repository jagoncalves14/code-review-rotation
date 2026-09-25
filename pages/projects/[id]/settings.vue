<script setup lang="ts">
import type { ProjectState } from '@/types/supabase'
import { useAddToast } from '@/composables/useAddToast'
import deleteProject from '@/services/projects/projects.delete'
import getProjectById from '@/services/projects/projects.get-by-id'
import updateProject from '@/services/projects/projects.update'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseCombobox from '~/components/BaseCombobox.vue'

// Get route params
const route = useRoute()
const projectId = route.params.id as string
const router = useRouter()
const addToast = useAddToast()

// Define page metadata
definePageMeta({
	layout: 'default',
	middleware: ['admin-only'], // Only admins can edit projects
})

// State
interface User {
	id: string
	name: string
	email: string
}

const loading = ref(true)
const saving = ref(false)
const deleting = ref(false)
const users = ref<User[]>([])
const assigneesOptions = ref<{ value: string, label: string }[]>([])
const reviewersOptions = ref<{ value: string, label: string }[]>([])
const showDeleteConfirmation = ref(false)

const projectForm = ref({
	id: '',
	name: '',
	rotationDuration: 15,
	startDate: '',
	numberOfReviewers: 2,
	assignees: [] as string[],
	reviewers: [] as string[],
	projectState: 'draft' as ProjectState,
	description: '',
})

// Methods
async function fetchUsers() {
	try {
		// Import the users service
		const { default: getAllUsers } = await import('@/services/users/users.get-all')

		// Get all users for assignee/reviewer selection
		const { data, error } = await getAllUsers(1, 100, '') // Get up to 100 users

		if (error) {
			throw error
		}

		users.value = data || []

		// Populate the options for comboboxes
		const options = users.value.map(user => ({
			value: user.id,
			label: user.name || user.email,
		}))

		assigneesOptions.value = options
		reviewersOptions.value = options
	} catch (error) {
		addToast(error instanceof Error ? error.message : 'Failed to load users', { variant: 'danger' })
	}
}

async function fetchProject() {
	loading.value = true

	try {
		const { data, error } = await getProjectById(projectId)

		if (error) {
			throw error
		}

		if (!data) {
			throw new Error('Project not found')
		}

		// Populate the form with project data
		projectForm.value = {
			id: data.id,
			name: data.name,
			rotationDuration: data.rotation_period_days,
			startDate: data.rotation_start_day,
			numberOfReviewers: data.reviewers_count,
			assignees: (data as any).assignee_ids || [],
			reviewers: (data as any).reviewer_ids || [],
			projectState: data.state,
			description: data.description || '',
		}
	} catch (error) {
		addToast(error instanceof Error ? error.message : 'Failed to load project', { variant: 'danger' })
		router.push('/projects')
	} finally {
		loading.value = false
	}
}

async function saveProject() {
	saving.value = true

	try {
		// Validate form
		if (!projectForm.value.name) {
			throw new Error('Project name is required')
		}

		if (projectForm.value.assignees.length === 0) {
			throw new Error('At least one assignee is required')
		}

		if (projectForm.value.reviewers.length === 0) {
			throw new Error('At least one reviewer is required')
		}

		// Process assignees and reviewers to account for newly created profiles
		interface CreatedProfile {
			originalName: string
			id: string
		}

		let finalAssigneeIds = [...projectForm.value.assignees]
		let finalReviewerIds = [...projectForm.value.reviewers]

		// Identify new profiles to be created
		const allExistingIds = assigneesOptions.value.map(opt => opt.value)

		// Extract new assignee names that need to be created
		const newAssigneeNames = projectForm.value.assignees
			.filter(id => !allExistingIds.includes(id) && !id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i))
			.map(name => ({ name }))

		// Extract new reviewer names that need to be created
		const newReviewerNames = projectForm.value.reviewers
			.filter(id => !allExistingIds.includes(id) && !id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i))
			.map(name => ({ name }))

		// Combine unique new profiles
		const newProfilesToCreate = [
			...newAssigneeNames,
			...newReviewerNames.filter(r => !newAssigneeNames.some(a => a.name === r.name)),
		]

		// Create new profiles if needed
		if (newProfilesToCreate.length > 0) {
			const { createProfile } = await import('@/services/profiles/profiles.create')

			// Process each new profile
			const createdProfiles: CreatedProfile[] = []
			for (const profileData of newProfilesToCreate) {
				try {
					// Creating new profile
					const { data, error } = await createProfile({
						name: profileData.name,
					})

					if (error) {
						console.error('Error creating profile:', error)
						continue
					}

					createdProfiles.push({
						originalName: profileData.name,
						id: data.id,
					})
				} catch (error) {
					console.error('Error creating profile:', error)
				}
			}

			// Replace string names with newly created profile IDs
			finalAssigneeIds = projectForm.value.assignees.map((id) => {
				const createdProfile = createdProfiles.find(p => p.originalName === id)
				return createdProfile ? createdProfile.id : id
			})

			finalReviewerIds = projectForm.value.reviewers.map((id) => {
				const createdProfile = createdProfiles.find(p => p.originalName === id)
				return createdProfile ? createdProfile.id : id
			})
		}

		// Filter out any non-UUID values
		finalAssigneeIds = finalAssigneeIds.filter(id =>
			allExistingIds.includes(id) || id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i),
		)

		finalReviewerIds = finalReviewerIds.filter(id =>
			allExistingIds.includes(id) || id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i),
		)

		// Update the project
		const { error } = await updateProject({
			id: projectForm.value.id,
			name: projectForm.value.name,
			rotation_period_days: projectForm.value.rotationDuration,
			rotation_start_day: projectForm.value.startDate,
			reviewers_count: projectForm.value.numberOfReviewers,
			state: projectForm.value.projectState as ProjectState,
			description: projectForm.value.description,
			assignee_ids: finalAssigneeIds,
			reviewer_ids: finalReviewerIds,
		})

		if (error) {
			throw error
		}

		addToast('Project updated successfully')

		// Refresh project data
		await fetchProject()
	} catch (error) {
		addToast(error instanceof Error ? error.message : 'Failed to update project', { variant: 'danger' })
	} finally {
		saving.value = false
	}
}

async function handleDeleteProject() {
	deleting.value = true

	try {
		const { success, error } = await deleteProject(projectId)

		if (error) {
			throw error
		}

		if (!success) {
			throw new Error('Failed to delete project')
		}

		addToast('Project deleted successfully')
		router.push('/projects')
	} catch (error) {
		addToast(error instanceof Error ? error.message : 'Failed to delete project', { variant: 'danger' })
		showDeleteConfirmation.value = false
	} finally {
		deleting.value = false
	}
}

function cancelEdit() {
	router.push('/projects')
}

// Lifecycle hooks
onMounted(async () => {
	await fetchUsers()
	await fetchProject()
})
</script>

<template>
	<section class="n-spacing-m n-margin-bs-xl mx-auto w-full max-w-screen-xl">
		<nord-card padding="l">
			<div slot="header">
				<h1 class="n-typography-headline-large">Edit Project</h1>
			</div>

			<div class="n-spacing-m">
				<nord-spinner v-if="loading" size="large" class="n-margin-m" />

				<form v-else class="n-stack n-gap-m" @submit.prevent="saveProject">
					<!-- Project Information -->
					<div class="n-stack n-gap-m">
						<!-- Project Name -->
						<nord-input
							v-model="projectForm.name"
							label="Project Name"
							required
							expand
							placeholder="Enter project name"
						/>

						<!-- Project Description -->
						<nord-textarea
							v-model="projectForm.description"
							label="Description"
							placeholder="Project description (optional)"
							expand
							rows="3"
						/>

						<nord-divider class="n-margin-b-m" />

						<!-- Rotation Settings -->
						<nord-fieldset label="Rotation Settings">
							<div class="n-stack n-gap-m">
								<!-- Rotation Duration -->
								<nord-input
									v-model="projectForm.rotationDuration"
									label="Rotation Duration (days)"
									type="number"
									min="1"
									required
									expand
									help-text="Number of days each rotation period lasts"
								/>

								<!-- Start Date -->
								<nord-date-picker
									v-model="projectForm.startDate"
									label="Start Day of Rotation"
									required
									expand
									help-text="The date the first rotation will begin"
									locale="en"
									format="yyyy-MM-dd"
								/>

								<!-- Number of Reviewers -->
								<nord-input
									v-model="projectForm.numberOfReviewers"
									label="Number of Reviewers to Assign"
									type="number"
									min="1"
									max="10"
									required
									expand
									help-text="How many reviewers should be assigned to each assignee"
								/>
							</div>
						</nord-fieldset>

						<nord-divider class="n-margin-b-m" />

						<!-- Assignees & Reviewers -->
						<nord-fieldset label="Team Members">
							<div class="n-stack n-gap-m">
								<!-- Assignees -->
								<BaseCombobox
									v-model="projectForm.assignees"
									label="Assignees"
									placeholder="Add assignee"
									:options="assigneesOptions"
									:value-as-object="false"
									multiple
									expand
									required
									create-option
									help-text="People who will be assigned to review others' work. Type to add new profiles."
								/>

								<!-- Reviewers -->
								<BaseCombobox
									v-model="projectForm.reviewers"
									label="Reviewers"
									placeholder="Add reviewer"
									:options="reviewersOptions"
									:value-as-object="false"
									multiple
									expand
									required
									create-option
									help-text="People who will review the assignees' work. Type to add new profiles."
								/>
							</div>
						</nord-fieldset>

						<!-- Project State -->
						<nord-fieldset label="Project State">
							<nord-segmented-control>
								<nord-segmented-control-item
									size="s"
									label="Draft"
									name="projectState"
									value="draft"
									:checked="projectForm.projectState === 'draft'"
									@change="projectForm.projectState = 'draft'"
								/>
								<nord-segmented-control-item
									size="s"
									label="Active"
									name="projectState"
									value="active"
									:checked="projectForm.projectState === 'active'"
									@change="projectForm.projectState = 'active'"
								/>
								<nord-segmented-control-item
									size="s"
									label="Inactive"
									name="projectState"
									value="inactive"
									:checked="projectForm.projectState === 'inactive'"
									@change="projectForm.projectState = 'inactive'"
								/>
							</nord-segmented-control>
							<p class="n-color-text-weaker n-margin-bs-s">
								Draft projects are not included in the rotation engine. Active projects will generate rotations automatically.
							</p>
						</nord-fieldset>
					</div>

					<!-- Action Buttons -->
					<div class="n-stack n-stack-horizontal-e n-justify-between n-gap-s n-margin-bs-l">
						<div>
							<nord-button
								variant="danger"
								type="button"
								@click="showDeleteConfirmation = true"
							>
								Delete Project
							</nord-button>
						</div>

						<div class="n-stack n-stack-horizontal-e n-gap-s">
							<nord-button
								variant="secondary"
								type="button"
								@click="cancelEdit"
							>
								Cancel
							</nord-button>
							<nord-button
								variant="primary"
								type="submit"
								:disabled="saving"
							>
								{{ saving ? 'Saving...' : 'Save Changes' }}
							</nord-button>
						</div>
					</div>
				</form>
			</div>
		</nord-card>

		<!-- Delete Confirmation Modal -->
		<nord-dialog
			:open="showDeleteConfirmation"
			title="Confirm Deletion"
			@close="showDeleteConfirmation = false"
		>
			<p class="n-margin-bs-m">
				Are you sure you want to delete this project? This action cannot be undone.
			</p>

			<p class="n-margin-bs-m n-color-text-danger">
				All project data, including rotations and assignments, will be permanently deleted.
			</p>

			<div slot="footer" class="n-stack n-stack-horizontal-e n-gap-s">
				<nord-button
					variant="secondary"
					@click="showDeleteConfirmation = false"
				>
					Cancel
				</nord-button>
				<nord-button
					variant="danger"
					:disabled="deleting"
					@click="handleDeleteProject"
				>
					{{ deleting ? 'Deleting...' : 'Delete Project' }}
				</nord-button>
			</div>
		</nord-dialog>
	</section>
</template>
