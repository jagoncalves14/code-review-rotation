<script setup lang="ts">
import type { Project, ProjectState } from '@/types/supabase'
import { useAddToast } from '@/composables/useAddToast'
import getAllProjects from '@/services/projects/projects.get-all'
import { refDebounced } from '@vueuse/core'
import { computed, onMounted, ref, watch } from 'vue'

// Define page metadata for layout
definePageMeta({
	layout: 'default',
	middleware: ['admin-only'],
})

// State
const projects = ref<Project[]>([])
const loading = ref(true)
const searchQuery = ref('')
const debouncedSearchQuery = refDebounced(searchQuery, 300)
const page = ref(1)
const pageSize = ref(10)
const totalCount = ref(0)

// Toast
const addToast = useAddToast()

// Computed
const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value))

// Helper function to get display text for project state
function getStateDisplay(state: ProjectState) {
	const stateMap = {
		draft: {
			text: 'Draft',
			variant: 'subtle',
		},
		active: {
			text: 'Active',
			variant: 'success',
		},
		inactive: {
			text: 'Inactive',
			variant: 'neutral',
		},
	}
	return stateMap[state] || { text: state, variant: 'subtle' }
}

// Methods
async function fetchProjects() {
	loading.value = true
	try {
		const { data, error, count } = await getAllProjects(page.value, pageSize.value, debouncedSearchQuery.value)

		if (error) {
			throw error
		}
		projects.value = data || []
		totalCount.value = count
	} catch (error) {
		addToast(error instanceof Error ? error.message : 'Failed to load projects', { variant: 'danger' })
	} finally {
		loading.value = false
	}
}

function handleSearch() {
	page.value = 1 // Reset to first page when searching
	fetchProjects()
}

function clearSearch() {
	searchQuery.value = ''
	page.value = 1
	fetchProjects()
}

function changePage(newPage: number) {
	page.value = newPage
	fetchProjects()
}

// Format date from ISO string to localized date
function formatDate(dateString: string): string {
	return new Date(dateString).toLocaleDateString()
}

// Watch for debounced search changes
watch(debouncedSearchQuery, () => {
	if (page.value !== 1) {
		page.value = 1
	}
	fetchProjects()
})

// Lifecycle
onMounted(fetchProjects)
</script>

<template>
	<section class="n-spacing-m n-margin-bs-xl mx-auto w-full max-w-screen-xl">
		<nord-card padding="l">
			<div slot="header" class="n-stack n-stack-horizontal-e n-align-center n-justify-between">
				<h1 class="n-typography-headline-large">Projects</h1>
			</div>

			<NuxtLink slot="header-end" to="/projects/create">
				<nord-button variant="primary">
					Create Project
				</nord-button>
			</NuxtLink>

			<div class="n-spacing-m">
				<!-- Search & Filter Bar -->
				<div class="n-spacing-s">
					<form @submit.prevent="handleSearch">
						<div class="n-stack n-gap-s n-stack-horizontal-e">
							<nord-input
								v-model="searchQuery"
								hide-label
								type="search"
								placeholder="Search by project name..."
							>
								<nord-icon slot="suffix" name="search" />
							</nord-input>
							<nord-button
								v-if="searchQuery"
								variant="secondary"
								size="m"
								@click="clearSearch"
							>
								Clear
							</nord-button>
						</div>
					</form>
				</div>

				<!-- Projects Table -->
				<nord-table class="n-margin-bs-l">
					<table>
						<thead>
							<tr>
								<th>Project Name</th>
								<th>Start Date</th>
								<th>Rotation Period (days)</th>
								<th>Status</th>
								<th class="n-table-align-right">Actions</th>
							</tr>
						</thead>
						<tbody v-if="!loading && projects.length">
							<tr v-for="project in projects" :key="project.id">
								<td>{{ project.name }}</td>
								<td>{{ formatDate(project.rotation_start_day) }}</td>
								<td>{{ project.rotation_period_days }}</td>
								<td>
									<nord-badge
										:variant="getStateDisplay(project.state).variant"
									>
										{{ getStateDisplay(project.state).text }}
									</nord-badge>
								</td>
								<td class="n-table-align-right">
									<div class="n-stack-horizontal-e n-justify-end n-gap-s">
										<NuxtLink :to="`/projects/${project.id}/settings`">
											<nord-button
												size="small"
												variant="primary"
											>
												Edit
											</nord-button>
										</NuxtLink>
										<NuxtLink :to="`/projects/${project.id}`">
											<nord-button
												size="small"
												variant="secondary"
											>
												View Rotations
											</nord-button>
										</NuxtLink>
									</div>
								</td>
							</tr>
						</tbody>
						<tbody v-else-if="loading">
							<tr>
								<td colspan="5" class="n-text-center">
									<nord-spinner size="medium" />
								</td>
							</tr>
						</tbody>
						<tbody v-else>
							<tr>
								<td colspan="5" class="n-text-center">
									<div class="n-typography-body">
										No projects found. Try adjusting your search or
										<NuxtLink to="/projects/create" class="n-link">create a new project</NuxtLink>.
									</div>
								</td>
							</tr>
						</tbody>
					</table>
				</nord-table>

				<!-- Pagination -->
				<div v-if="totalPages > 1" class="n-stack n-gap-s n-stack-horizontal-e">
					<div class="n-typography-body">
						Showing {{ (page - 1) * pageSize + 1 }} to {{ Math.min(page * pageSize, totalCount) }} of {{ totalCount }} projects
					</div>
					<div class="n-stack n-stack-horizontal-e n-gap-xs">
						<nord-button
							size="small"
							:disabled="page === 1"
							@click="changePage(page - 1)"
						>
							Previous
						</nord-button>
						<nord-button
							v-for="pageNum in totalPages"
							:key="pageNum"
							size="small"
							:variant="page === pageNum ? 'primary' : 'secondary'"
							@click="changePage(pageNum)"
						>
							{{ pageNum }}
						</nord-button>
						<nord-button
							size="small"
							:disabled="page === totalPages"
							@click="changePage(page + 1)"
						>
							Next
						</nord-button>
					</div>
				</div>
			</div>
		</nord-card>
	</section>
</template>
