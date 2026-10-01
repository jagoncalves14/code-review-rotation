<script setup lang="ts">
import type { ProjectState } from '@/types/supabase'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAddToast } from '@/composables/useAddToast'
import BaseCombobox from '~/components/BaseCombobox.vue'
// Define page metadata
definePageMeta({
	layout: 'default',
	middleware: ['admin-only'], // Only admins can create projects
})

// State
interface User {
	id: string
	name: string
	email: string
}

const router = useRouter()
const addToast = useAddToast()
const loading = ref(false)
const saving = ref(false)
const users = ref<User[]>([])
const assigneesOptions = ref<{ value: string, label: string }[]>([])
const reviewersOptions = ref<{ value: string, label: string }[]>([])

const projectForm = ref({
	name: '',
	rotationDuration: 15,
	startDate: new Date().toISOString().split('T')[0],
	numberOfReviewers: 2,
	projectState: 'draft' as ProjectState,
	assignees: [] as string[],
	reviewers: [] as string[],
})

// Methods
async function fetchUsers() {
	loading.value = true

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

		// Keep track of all assignee/reviewer IDs, including newly created ones
		let finalAssigneeIds = [...projectForm.value.assignees]
		let finalReviewerIds = [...projectForm.value.reviewers]

		// Identify new profiles to be created (any string that doesn't match an existing option value)
		const allExistingIds = assigneesOptions.value.map(opt => opt.value)

		// Extract new assignee names that need to be created - look for items that aren't UUIDs
		const newAssigneeNames = projectForm.value.assignees
			.filter(id => !allExistingIds.includes(id) && !id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i))
			.map(name => ({ name }))

		// Extract new reviewer names that need to be created - look for items that aren't UUIDs
		const newReviewerNames = projectForm.value.reviewers
			.filter(id => !allExistingIds.includes(id) && !id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i))
			.map(name => ({ name }))

		// Combine unique new profiles - ensure we don't duplicate people in both lists
		const newProfilesToCreate = [
			...newAssigneeNames,
			...newReviewerNames.filter(r => !newAssigneeNames.some(a => a.name === r.name)),
		]

		// Create new profiles
		if (newProfilesToCreate.length > 0) {
			const { createProfile } = await import('@/services/profiles/profiles.create')

			// Process each new profile
			interface CreatedProfile {
				originalName: string
				id: string
			}

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

					// Profile created successfully
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
		} else {
			finalAssigneeIds = [...projectForm.value.assignees]
			finalReviewerIds = [...projectForm.value.reviewers]
		}

		// Filter out any remaining non-ID values (in case profile creation failed)
		finalAssigneeIds = finalAssigneeIds.filter(id =>
			allExistingIds.includes(id) || id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i),
		)

		finalReviewerIds = finalReviewerIds.filter(id =>
			allExistingIds.includes(id) || id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i),
		)

		// Import the project creation service
		const createProject = await import('@/services/projects/projects.create').then(m => m.default)

		// Create the project with the final IDs
		const { data, error } = await createProject({
			name: projectForm.value.name,
			rotation_period_days: projectForm.value.rotationDuration,
			rotation_start_day: projectForm.value.startDate,
			reviewers_count: projectForm.value.numberOfReviewers,
			assignee_ids: finalAssigneeIds,
			reviewer_ids: finalReviewerIds,
			state: projectForm.value.projectState,
		})

		if (error) {
			throw error
		}

		addToast('Project created successfully')
		if (data) {
			router.push(`/projects/${data.id}/settings`)
		}
	} catch (error) {
		addToast(error instanceof Error ? error.message : 'Failed to create project', { variant: 'danger' })
	} finally {
		saving.value = false
	}
}

function cancelCreate() {
	router.push('/projects')
}

// Lifecycle hooks
onMounted(fetchUsers)
</script>

<template>
	<section class="n-spacing-m n-margin-bs-xl mx-auto w-full max-w-screen-xl">
		<nord-card padding="l">
			<div slot="header">
				<h1 class="n-typography-headline-large">Create New Project</h1>
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
					<div class="n-stack n-stack-horizontal-e n-gap-s n-margin-bs-l">
						<nord-button
							variant="secondary"
							type="button"
							@click="cancelCreate"
						>
							Cancel
						</nord-button>
						<nord-button
							variant="primary"
							type="submit"
							:disabled="saving"
						>
							{{ saving ? 'Creating...' : 'Create Project' }}
						</nord-button>
					</div>
				</form>
			</div>
		</nord-card>
	</section>
</template>
