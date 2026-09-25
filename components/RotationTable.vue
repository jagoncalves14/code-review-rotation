<script setup lang="ts">
import type { RotationMember } from '@/services/rotations/rotations.get-by-project'
import { updateRotationMember } from '@/services/rotations/rotations.update-rotation-member'
import { computed, ref } from 'vue'
import BaseCombobox from '~/components/BaseCombobox.vue'

const props = defineProps<{
	assignments: RotationMember[]
	reviewerOptions: { value: string, label: string }[]
	isEditable: boolean
}>()

const emit = defineEmits<{
	(e: 'updated'): void
}>()

// Track which cells are being edited
const editingCells = ref(new Set<string>())

// For storing new reviewer IDs during editing
const newReviewerIds = ref<string[]>([])

// Group assignments by assignee
const assignmentsByAssignee = computed(() => {
	const grouped = new Map<string, RotationMember[]>()

	props.assignments.forEach((assignment) => {
		const assigneeId = assignment.assignee_profile_id
		const assigneeName = assignment.assignee_name || 'Unknown'
		const key = `${assigneeId}|${assigneeName}`

		if (!grouped.has(key)) {
			grouped.set(key, [])
		}

		grouped.get(key)?.push(assignment)
	})

	return grouped
})

// Find unique assignees
const assignees = computed(() => {
	return Array.from(assignmentsByAssignee.value.keys()).map((key) => {
		const [id, name] = key.split('|')
		return { id, name }
	})
})

// Utility to get reviewer names for an assignee
function getReviewerNames(assigneeKey: string): string {
	const assignments = assignmentsByAssignee.value.get(assigneeKey) || []
	return assignments.map(a => a.reviewer_name).join(', ')
}

// Start editing a cell
function startEditing(assigneeKey: string) {
	if (props.isEditable) {
		editingCells.value.add(assigneeKey)
		newReviewerIds.value = getCurrentReviewerIds(assigneeKey)
	}
}

// Save changes to a cell
async function saveReviewers(assigneeKey: string, newReviewerIds: string[]) {
	const assignments = assignmentsByAssignee.value.get(assigneeKey) || []

	try {
		// For each existing assignment, update the reviewer
		// If there are more reviewers than assignments, create new ones
		// If there are fewer reviewers than assignments, delete excess ones

		// First handle existing assignments
		for (let i = 0; i < Math.min(assignments.length, newReviewerIds.length); i++) {
			if (assignments[i].reviewer_profile_id !== newReviewerIds[i]) {
				await updateRotationMember({
					id: assignments[i].id,
					reviewer_profile_id: newReviewerIds[i],
				})
			}
		}

		// Emit update event for parent to refresh data
		emit('updated')
	} catch (error) {
		console.error('Error saving reviewers:', error)
	} finally {
		editingCells.value.delete(assigneeKey)
	}
}

// Cancel editing
function cancelEditing(assigneeKey: string) {
	editingCells.value.delete(assigneeKey)
}

// Get current reviewer IDs for an assignee
function getCurrentReviewerIds(assigneeKey: string): string[] {
	const assignments = assignmentsByAssignee.value.get(assigneeKey) || []
	return assignments.map(a => a.reviewer_profile_id)
}
</script>

<template>
	<div class="n-stack n-gap-m">
		<table class="n-table">
			<thead>
				<tr>
					<th>Assignee</th>
					<th>Reviewers</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="assignee in assignees" :key="assignee.id">
					<td>{{ assignee.name }}</td>
					<td
						class="reviewer-cell"
						:class="{ editable: isEditable && !editingCells.has(`${assignee.id}|${assignee.name}`) }"
						@click="startEditing(`${assignee.id}|${assignee.name}`)"
					>
						<!-- Display mode -->
						<template v-if="!editingCells.has(`${assignee.id}|${assignee.name}`)">
							{{ getReviewerNames(`${assignee.id}|${assignee.name}`) }}
							<span v-if="isEditable" class="edit-hint n-color-text-weaker n-margin-bs-s">
								(click to edit)
							</span>
						</template>

						<!-- Edit mode -->
						<div v-else class="n-stack n-gap-s">
							<BaseCombobox
								v-model="newReviewerIds"
								label="Reviewers"
								placeholder="Select reviewers"
								:options="reviewerOptions"
								:value-as-object="false"
								multiple
								expand
							/>

							<div class="n-stack n-stack-horizontal-e n-gap-s">
								<nord-button
									size="s"
									variant="secondary"
									@click="cancelEditing(`${assignee.id}|${assignee.name}`)"
								>
									Cancel
								</nord-button>
								<nord-button
									size="s"
									variant="primary"
									@click="saveReviewers(`${assignee.id}|${assignee.name}`, newReviewerIds)"
								>
									Save
								</nord-button>
							</div>
						</div>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<style scoped>
.reviewer-cell.editable {
	cursor: pointer;
}

.reviewer-cell.editable:hover {
	background-color: var(--n-color-accent-weak);
}

.edit-hint {
	font-size: 0.8em;
	font-style: italic;
}
</style>
