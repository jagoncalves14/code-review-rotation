<script setup lang="ts">
import { useAddToast } from '@/composables/useAddToast'
import getProjectById from '@/services/projects/projects.get-by-id'
import { getRotationsByProject } from '@/services/rotations/rotations.get-by-project'
import { getRotationDetails } from '@/services/rotations/rotations.get-rotation-details'
import { triggerNewRotation } from '@/services/rotations/rotations.trigger-new'
import { useRouter } from 'vue-router'
import RotationTable from '~/components/RotationTable.vue'

// Get route params
const route = useRoute()
const projectId = route.params.id as string
const router = useRouter()
const addToast = useAddToast()

// Define page metadata
definePageMeta({
	layout: 'default',
})

// State
const project = ref<any>(null)
const rotations = ref<any[]>([])
const selectedRotationId = ref<string | null>(null)
const currentRotationDetails = ref<any>(null)
const loading = ref(true)
const loadingRotation = ref(false)
const triggeringRotation = ref(false)
const reviewerOptions = ref<{ value: string, label: string }[]>([])

function formattedDate(dateString: string) {
	return new Date(dateString).toLocaleDateString()
}

// Methods
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

		project.value = data
	} catch (error) {
		addToast(error instanceof Error ? error.message : 'Failed to load project', { variant: 'danger' })
		router.push('/projects')
	} finally {
		loading.value = false
	}
}

async function fetchRotations() {
	try {
		const { rotations: projectRotations, activeRotation, error } = await getRotationsByProject(projectId)

		if (error) {
			throw error
		}

		rotations.value = projectRotations

		// If we have an active rotation, select it by default
		if (activeRotation) {
			selectedRotationId.value = activeRotation.id
		} else if (projectRotations.length > 0) {
			// Otherwise select the most recent rotation
			selectedRotationId.value = projectRotations[0].id
		}

		// If we have a selected rotation, fetch its details
		if (selectedRotationId.value) {
			await fetchRotationDetails(selectedRotationId.value)
		}
	} catch (error) {
		addToast(error instanceof Error ? error.message : 'Failed to load rotations', { variant: 'danger' })
	}
}

async function fetchRotationDetails(rotationId: string) {
	loadingRotation.value = true

	try {
		const { data, error } = await getRotationDetails(rotationId)

		if (error) {
			throw error
		}

		if (!data) {
			throw new Error('Rotation not found')
		}

		currentRotationDetails.value = data

		// Prepare reviewer options for the combobox
		reviewerOptions.value = data.reviewers.map((reviewer: any) => ({
			value: reviewer.id,
			label: reviewer.name,
		}))
	} catch (error) {
		addToast(error instanceof Error ? error.message : 'Failed to load rotation details', { variant: 'danger' })
	} finally {
		loadingRotation.value = false
	}
}

async function handleTriggerNewRotation() {
	if (!confirm('Are you sure you want to trigger a new rotation? This will create a new set of assignments.')) {
		return
	}

	triggeringRotation.value = true

	try {
		const { success, error, rotationId } = await triggerNewRotation(projectId)

		if (error) {
			throw error
		}

		if (!success) {
			throw new Error('Failed to trigger new rotation')
		}

		addToast('New rotation triggered successfully')

		// Refresh the rotations list
		await fetchRotations()

		// If we got a rotationId back, select it
		if (rotationId) {
			selectedRotationId.value = rotationId
			await fetchRotationDetails(rotationId)
		}
	} catch (error) {
		addToast(error instanceof Error ? error.message : 'Failed to trigger new rotation', { variant: 'danger' })
	} finally {
		triggeringRotation.value = false
	}
}

function handleRotationSelect(event: Event) {
	const rotationId = (event.target as HTMLSelectElement).value
	selectedRotationId.value = rotationId
	fetchRotationDetails(rotationId)
}

// Fetch data when component mounts
onMounted(async () => {
	await fetchProject()
	await fetchRotations()
})
</script>

<template>
	<section class="n-spacing-m n-margin-bs-xl mx-auto w-full max-w-screen-xl">
		<nord-card padding="l">
			<div slot="header" class="n-stack n-stack-horizontal n-justify-between n-align-center">
				<div v-if="project">
					<h1 class="n-typography-headline-large">{{ project.name }}</h1>
				</div>
			</div>

			<div slot="header-end" class="n-stack n-stack-horizontal n-gap-s">
				<NuxtLink to="/projects">
					<nord-button
						variant="secondary"
						type="button"
					>
						Back to Projects
					</nord-button>
				</NuxtLink>

				<nord-button
					variant="primary"
					:disabled="triggeringRotation"
					@click="handleTriggerNewRotation"
				>
					{{ triggeringRotation ? 'Triggering...' : 'Trigger New Rotation' }}
				</nord-button>
			</div>

			<div class="n-spacing-m">
				<nord-spinner v-if="loading" size="large" class="n-margin-m" />

				<div v-else-if="project" class="n-stack n-gap-m">
					<p class="n-typography-body">
						{{ project.description || 'No description' }}
					</p>

					<!-- Project Details -->
					<nord-fieldset label="Project Information">
						<div class="n-stack n-stack-horizontal n-gap-m">
							<div>
								<strong>Rotation Period:</strong> {{ project.rotation_period_days }} days
							</div>
							<div>
								<strong>Start Date:</strong> {{ formattedDate(project.rotation_start_day) }}
							</div>
							<div>
								<strong>State:</strong>
								<nord-badge :variant="project.state === 'active' ? 'positive' : (project.state === 'draft' ? 'notice' : 'default')">
									{{ project.state.charAt(0).toUpperCase() + project.state.slice(1) }}
								</nord-badge>
							</div>
						</div>
					</nord-fieldset>

					<!-- Rotation Selection -->
					<nord-fieldset label="Rotations">
						<div class="n-stack n-gap-m">
							<div class="n-stack n-stack-horizontal n-justify-between n-align-center">
								<div>
									<nord-select
										v-if="rotations.length > 0"
										:value="selectedRotationId || ''"
										@change="handleRotationSelect"
									>
										<option v-for="rotation in rotations" :key="rotation.id" :value="rotation.id">
											{{ formattedDate(rotation.start_date) }} - {{ formattedDate(rotation.end_date) }}
											{{ rotation.manually_triggered ? '(Manual)' : '' }}
										</option>
									</nord-select>
									<p v-else class="n-color-text-weaker">No rotations yet.</p>
								</div>
							</div>
						</div>
					</nord-fieldset>

					<!-- Rotation Details -->
					<nord-fieldset label="Rotation Details">
						<nord-spinner v-if="loadingRotation" size="large" class="n-margin-m" />

						<div v-else-if="currentRotationDetails" class="n-stack n-gap-m">
							<div class="n-stack n-stack-horizontal n-gap-m n-justify-between n-align-center">
								<div>
									<strong>Rotation Period:</strong>
									{{ formattedDate(currentRotationDetails.rotation.start_date) }} -
									{{ formattedDate(currentRotationDetails.rotation.end_date) }}
								</div>
								<div>
									<strong>Type:</strong>
									{{ currentRotationDetails.rotation.manually_triggered ? 'Manual' : 'Automatic' }}
								</div>
							</div>

							<!-- Rotation Table Component -->
							<RotationTable
								:assignments="currentRotationDetails.members"
								:reviewer-options="reviewerOptions"
								:is-editable="true"
								@updated="fetchRotationDetails(selectedRotationId as string)"
							/>
						</div>

						<p v-else class="n-color-text-weaker">
							No rotation details available.
						</p>
					</nord-fieldset>

					<div class="n-stack n-stack-horizontal n-gap-s">
						<NuxtLink :to="`/projects/${projectId}/settings`">
							<nord-button
								variant="secondary"
								type="button"
								:disabled="project.state !== 'active'"
							>
								Edit Settings
							</nord-button>
						</NuxtLink>
					</div>
				</div>
			</div>
		</nord-card>
	</section>
</template>
