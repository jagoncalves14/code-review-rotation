<script setup lang="ts">
/**
 * This is a label component that provides consistent styling and functionality for form labels across the application.
 * It serves as a base component for form element labels, ensuring uniform appearance and behavior.
 *
 * Notes:
 * - The label is hidden if the `hideLabel` prop is set to `true` but still shown to screen readers.
 * - The HTML within the label is bit of a mess, but it's necessary to ensure consistent
 * appearance across all components and usage scenarios in the application.
 */

export interface Props {
	label: string
	hideLabel?: boolean
	hideOptional?: boolean
	required?: boolean
}

withDefaults(defineProps<Props>(), {
	required: true,
})
</script>

<template>
	<label :class="{ 'sr-only': hideLabel }">
		{{ label
		}}<span
			v-if="!required && !hideOptional"
			class="n-font-weight n-color-text-weaker"
		>&nbsp;(optional)</span>
	</label>
</template>
