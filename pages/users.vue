<script setup lang="ts">
import { useAddToast } from '@/composables/useAddToast'
import getAllUsers from '@/services/users/users.get-all'
import { refDebounced } from '@vueuse/core'
import { computed, onMounted, ref, watch } from 'vue'

// Define page metadata for layout and authorization
definePageMeta({
	layout: 'default',
	middleware: ['admin-only'],
})

// State
const users = ref<Array<{ id: string, name: string, email: string, is_admin: boolean }>>([])
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

// Methods
async function fetchUsers() {
	loading.value = true
	try {
		const { data, error, count } = await getAllUsers(page.value, pageSize.value, debouncedSearchQuery.value)

		if (error) {
			throw error
		}
		users.value = data || []
		totalCount.value = count
	} catch (error) {
		addToast(error instanceof Error ? error.message : 'Failed to load users', { variant: 'danger' })
	} finally {
		loading.value = false
	}
}

function handleSearch() {
	page.value = 1 // Reset to first page when searching
	fetchUsers()
}

function clearSearch() {
	searchQuery.value = ''
	page.value = 1
	fetchUsers()
}

function changePage(newPage: number) {
	page.value = newPage
	fetchUsers()
}

function handleResetPassword(userId: string) {
	// Implementation for password reset functionality
	addToast(`Password reset feature will be implemented for user ${userId}`)
}

// Watch for debounced search changes
watch(debouncedSearchQuery, () => {
	if (page.value !== 1) {
		page.value = 1
	}
	fetchUsers()
})

// Lifecycle
onMounted(fetchUsers)
</script>

<template>
	<section class="n-spacing-m">
		<nord-card>
			<div class="n-spacing-m">
				<h1 class="n-typography-headline-large">Users</h1>

				<!-- Search & Filter Bar -->
				<div class="n-spacing-s">
					<form class="n-width-full" @submit.prevent="handleSearch">
						<div class="n-stack n-gap-s n-stack-horizontal-e">
							<div>
								<nord-input
									v-model="searchQuery"
									type="search"
									placeholder="Search by name or email..."
									class="n-width-full"
								>
									<nord-icon slot="suffix" name="search" />
								</nord-input>
							</div>

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

				<!-- Users Table -->
				<nord-table class="n-margin-bs-l n-width-full">
					<table>
						<thead>
							<tr>
								<th>Name</th>
								<th>Email</th>
								<th>Role</th>
								<th class="n-table-align-right">Actions</th>
							</tr>
						</thead>
						<tbody v-if="!loading && users.length">
							<tr v-for="user in users" :key="user.id">
								<td>{{ user.name || 'No name' }}</td>
								<td>{{ user.email || 'No email available' }}</td>
								<td>
									<nord-badge v-if="user.is_admin" variant="warning">Admin</nord-badge>
									<span v-else>User</span>
								</td>
								<td class="n-table-align-right">
									<div class="n-stack-horizontal-e n-gap-s n-justify-end">
										<nord-button
											size="small"
											variant="primary"
											:to="`/users/${user.id}`"
										>
											Edit
										</nord-button>
										<nord-button
											size="small"
											variant="secondary"
											@click="handleResetPassword(user.id)"
										>
											Reset Password
										</nord-button>
									</div>
								</td>
							</tr>
						</tbody>
						<tbody v-else-if="loading">
							<tr>
								<td colspan="4" class="n-text-center">
									<nord-spinner class="n-margin-auto" size="medium" />
								</td>
							</tr>
						</tbody>
						<tbody v-else>
							<tr>
								<td colspan="4" class="n-text-center">
									<div class="n-typography-body">
										No users found. Try adjusting your search.
									</div>
								</td>
							</tr>
						</tbody>
					</table>
				</nord-table>

				<!-- Pagination -->
				<div v-if="totalPages > 1" class="n-stack n-gap-s n-stack-horizontal-e n-margin-top-m">
					<div class="n-typography-body">
						Showing {{ (page - 1) * pageSize + 1 }} to {{ Math.min(page * pageSize, totalCount) }} of {{ totalCount }} users
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
