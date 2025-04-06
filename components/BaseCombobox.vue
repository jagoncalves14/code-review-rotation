<script lang="ts" setup>
import Multiselect from '@vueform/multiselect'
import '@vueform/multiselect/themes/default.css'

export interface Option {
	value: string | number
	label: string
	disabled?: boolean
	meta?: { bold: boolean }
}

export interface GroupOption {
	label: string
	options: Option[]
}

export interface OptionSlot {
	option: Option
	isPointed: Multiselect['isPointed']
	isSelected: Multiselect['isSelected']
}

export interface TagSlot {
	option: { label: string, value: string }
	handleTagRemove: Multiselect['handleTagRemove']
}

export interface SingleLabelSlot {
	value: Option
}

export interface MultiselectInstance {
	focus: () => Multiselect['focus']
	open: () => Multiselect['open']
	close: () => Multiselect['close']
	$el: HTMLElement
	hasSelected: boolean
}

export type Size = 's' | 'm' | 'l'

export type OptionAsValue = Pick<Option, 'value' | 'label'>

export type CSSInlineSizeString =
	| `var(--n-${string})` // TODO: Improve this type for more accurate type checks
	| `${number}${'px' | 'em' | 'rem' | '%' | 'ch'}`
	| 'auto'
	| 'none'

export type VueInstance = ComponentPublicInstance
export type MaybeElementRef<T extends MaybeElement = MaybeElement> = MaybeRef<T>
export type MaybeElement =
	| HTMLElement
	| SVGElement
	| VueInstance
	| undefined
	| null

/**
 * This is a wrapper on top of [vueform/multiselect](https://github.com/vueform/multiselect),
 * with Provet Cloud Design System styling applied and options for our needs.
 *
 * A combobox that can be used for a single select and a multi select.
 * The multi select variant displays the selection as tags inside the input.
 *
 * Don't use this base component, instead use one of the Combobox* components depending on your needs.
 */
export interface Props {
	modelValue?:
		| string
		| string[]
		| number
		| number[]
		| OptionAsValue
		| OptionAsValue[]
		| null
	/**
	 * Label for the combobox.
	 */
	label: string
	/**
	 * Optional ID to be assigned to the combobox.
	 */
	id?: string
	/**
	 * Optional hint text to be displayed with the combobox.
	 */
	hint?: string
	/**
	 * Optional error to be shown with the combobox.
	 */
	error?: string
	/**
	 * Determines whether the combobox is required or not.
	 * A combobox marked as required will be announced as such to users of assistive technology.
	 * When using this property you need to also set "novalidate" attribute on a form element to prevent browser from displaying its own validation errors.
	 */
	required?: boolean
	/**
	 * Visually hide the optional indicator, but still show required attribute to assistive technologies like screen readers.
	 */
	hideOptional?: boolean
	/**
	 * Controls whether the combobox expands to fill the width of its container.
	 */
	expand?: boolean
	/**
	 * The size of the component.
	 */
	size?: Size
	/**
	 * Allows more than one option to be selected. Will display the selection as tags within the select.
	 */
	multiple?: boolean
	/**
	 * Placeholder text to display within the combobox. In order to use `placeholder` slot, set `placeholder` to `true`.
	 * In case the content of the placeholder is being passed by props, fill prop with a string.
	 */
	placeholder?: string
	/**
	 * Visually hide the label, but still show it to assistive technologies like screen readers.
	 */
	hideLabel?: boolean
	/**
	 * Makes the component disabled. This prevents users from being able to interact with the component, and conveys its inactive state to assistive technologies.
	 */
	disabled?: boolean
	/**
	 * List of options.
	 *
	 * Should be an array of Option's
	 * Or a Function returning a Promise (async function) with `query` and `select$` params.
	 * The `select$` represents the [Multiselect](https://github.com/vueform/multiselect) component and its API can be accessed.
	 * The promise should return an array of Option's or one Option.
	 */
	// eslint-disable-next-line ts/no-unsafe-function-type
	options?: Option[] | GroupOption[] | Function
	/**
	 * Whether the value should be stored as an object (with type Option).
	 *
	 * This is needed when you want to have default values combined with async options,
	 * because if a plain value is not among the options it has no idea of what the label should be of that option.
	 *
	 * If false: `value: ['js','jsx','ts']`
	 * If true: `value: [{value: 'js', label: 'JavaScript'}, {value: 'jsx', label: 'JSX'}, {value: 'ts', label: 'TypeScript'}]`
	 */
	valueAsObject?: boolean
	/**
	 * Whether options should be grouped.
	 */
	groups?: boolean
	/**
	 * Whether it should allow creating new options based on the search query.
	 */
	createOption?: boolean
	/**
	 * Whether option list should be filtered by the search query.
	 * This may be set to false if you are handling filtering manually when returning async options.
	 */
	filterResults?: boolean
	/**
	 * The minimum number of characters that should be typed to refresh async options.
	 * If `0`, it will refresh even when the search field becomes empty.
	 */
	minChars?: number
	/**
	 * Whether a loading spinner should be shown.
	 */
	loading?: boolean
	/**
	 * Whether async options should be loaded initially (with an empty query).
	 */
	resolveOnLoad?: boolean
	/**
	 * Whether async options should be loaded when the combobox is opened (with an empty query).
	 */
	resolveOnOpen?: boolean
	/**
	 * The delay in milliseconds that should occur between the last typed character and refreshing an async option list.
	 *
	 * If `-1` the option list will not refresh when the search query changes (default).
	 * If `0` it will refresh without delay.
	 */
	delay?: number
	/**
	 * The maximum number of options that should be displayed.
	 *
	 * Mainly used together with the `infiniteScroll` prop.
	 *
	 * If `-1` the number of options won't be limited (default).
	 */
	maxDisplayedOptions?: number
	/**
	 * The maximum number of options that can be selected when `multiple` is true.
	 *
	 * If `-1` the number of options won't be limited (default).
	 */
	maxSelectableOptions?: number
	/**
	 * Whether the actual option nodes should only be loaded on scroll.
	 *
	 * The `maxDisplayedOptions` prop defines how many options are loaded initially and in each new batch.
	 */
	infiniteScroll?: boolean
	/**
	 * Whether the dropdown with options opens when focused
	 */
	openOnFocus?: boolean
	/**
	 * Whether the option list should be displayed above or below the multiselect by default.
	 * If the combobox is on the bottom of a page, it's recommended to set it to 'top'.
	 */
	defaultOpenDirection?: 'top' | 'bottom'
	/**
	 * Whether to display the custom styled label for in-line editing
	 */
	inlineEdit?: boolean
	/**
	 * Text to display for no available options
	 */
	noOptionsText?: string
	/**
	 * Text to display for no available results from the search
	 */
	noResultsText?: string
	/**
	 * Option that lets the user clear the value
	 */
	canClear?: boolean
	/**
	 * Option that lets the user deselect a value
	 */
	canDeselect?: boolean
	/**
	 * Option that lets the user search for an option
	 */
	searchable?: boolean
	/**
	 * Option that lets the user search for an option
	 */
	maxHeight?: CSSInlineSizeString
}

const props = withDefaults(defineProps<Props>(), {
	modelValue: '',
	id: undefined,
	hint: undefined,
	error: undefined,
	required: true,
	expand: false,
	size: 'm',
	multiple: false,
	placeholder: undefined,
	hideLabel: false,
	hideOptional: false,
	disabled: false,
	options: undefined,
	valueAsObject: false,
	createOption: false,
	filterResults: true,
	minChars: 0,
	resolveOnLoad: true,
	resolveOnOpen: false,
	delay: -1,
	maxDisplayedOptions: -1,
	maxSelectableOptions: -1,
	infiniteScroll: false,
	openOnFocus: false,
	defaultOpenDirection: 'bottom',
	inlineEdit: false,
	noOptionsText: undefined,
	noResultsText: undefined,
	canClear: true,
	canDeselect: true,
	searchable: true,
	maxHeight: undefined,
})

const emit = defineEmits([
	'update:modelValue',
	'focus',
	'blur',
	'change',
	'searchChange',
])

const value = computed({
	get: () => {
		if (props.multiple) {
			return Array.isArray(props.modelValue) ? props.modelValue : []
		}
		return props.modelValue
	},
	set: (value) => {
		// vueform/multiselect sets the value to null on clear (when in single mode) but we want an empty string
		emit('update:modelValue', value ?? '')
	},
})

const id = props.id || useId()!
const labelId = `label-${id}`
const hintId = `hint-${id}`
const errorId = `error-${id}`
const multiselectId = `multiselect-${id}`

const multiselectInstanceElement = useTemplateRef<MultiselectInstance>(
	'multiselectInstanceRef',
)

function focusSelect() {
	// If searchable, focus the input field
	if (props.searchable) {
		return multiselectInstanceElement.value?.focus()
	}

	// Otherwise, focus the wrapper for better keyboard navigation
	const multiselectElement = multiselectInstanceElement.value?.$el
	const multiSelectWrapper = multiselectElement?.querySelector(
		'.multiselect-wrapper',
	) as HTMLElement
	multiSelectWrapper?.focus()
}

const maxHeight = computed(() => {
	if (props.maxHeight) {
		return props.maxHeight
	}

	const options = props.options || []
	if (options.length > 10) {
		return '20rem'
	}

	return '10rem'
})

const hasError = computed(() => Boolean(props.error))

const isOpen = ref(false)

function onOpen(select$: Multiselect) {
	isOpen.value = true
	focusSelect()

	if (
		props.resolveOnOpen
		// TODO: `noOptions` is not a valid prop on Multiselect
		&& (select$ as unknown as { noOptions: boolean }).noOptions
	) {
		select$.resolveOptions(null)
	}
}

function onClose() {
	isOpen.value = false
	emit('blur', value.value)
}

function onFocus() {
	focusSelect()
	emit('focus', value.value)

	if (props.openOnFocus) {
		multiselectInstanceElement.value?.open()
	}
}

function onBlur() {
	if (!isOpen.value) {
		emit('blur', value.value)
	}
}

function onChange(value: string | null) {
	emit('change', value)
}

function onSearchChange(value: string) {
	emit('searchChange', value)
}

onMounted(() => {
	multiselectInstanceElement.value?.$el.addEventListener('focus', onFocus, true)
	multiselectInstanceElement.value?.$el.addEventListener('blur', onBlur, true)
})

onBeforeUnmount(() => {
	multiselectInstanceElement.value?.$el.removeEventListener(
		'focus',
		onFocus,
		true,
	)
	multiselectInstanceElement.value?.$el.removeEventListener(
		'blur',
		onBlur,
		true,
	)
})

onClickOutside(
	multiselectInstanceElement as unknown as MaybeElementRef<HTMLElement>,
	() => {
		multiselectInstanceElement.value?.close()
	},
)

defineExpose({
	focus: focusSelect,
})
</script>

<template>
	<div
		class="base-combobox"
		:class="{
			expand,
			multiple,
			'invalid': hasError,
			'size-s': inlineEdit || size === 's',
			'size-l': !inlineEdit && size === 'l',
			'has-selected': multiselectInstanceElement?.hasSelected,
		}"
	>
		<div
			class="label-container"
			:class="{
				'sr-only': hideLabel,
				'inline-field-label': inlineEdit,
				'n-margin-be-s': !hideLabel,
			}"
		>
			<BaseLabel
				:id="labelId"
				class="n-label"
				:label
				:hide-label
				:hide-optional
				:required
				@click="focusSelect"
			/>

			<div
				v-show="hint"
				:id="hintId"
				class="n-caption n-hint"
				:class="{ 'n-padding-bs-xs': hint }"
			>
				{{ hint }}
			</div>
		</div>

		<Multiselect
			:id="multiselectId"
			ref="multiselectInstanceRef"
			v-model="value"
			:aria="{
				'aria-labelledby': labelId,
				'aria-describedby': `${hintId} ${errorId}`,
				...(hasError ? { 'aria-invalid': 'true' } : {}),
				...(required ? { 'aria-required': 'true' } : {}),
			}"
			:mode="multiple ? 'tags' : 'single'"
			:close-on-select="!multiple"
			:hide-selected="false"
			:searchable
			:placeholder
			:disabled
			:groups
			:options
			:object="valueAsObject"
			:create-option
			:filter-results
			:min-chars
			:resolve-on-load
			:loading
			:delay
			:limit="maxDisplayedOptions"
			:max="maxSelectableOptions"
			:infinite="infiniteScroll"
			:no-options-text="noOptionsText ?? 'The list is empty. Start searching or try different keywords.'"
			:no-results-text="noResultsText ?? 'No results found. Try different keywords.'"
			:open-direction="defaultOpenDirection"
			:can-clear
			:can-deselect
			autocomplete="off"
			@open="onOpen"
			@close="onClose"
			@change="onChange"
			@search-change="onSearchChange"
		>
			<template #option="{ option, isPointed, isSelected }">
				<slot name="option" :option :is-pointed :is-selected>
					<div
						class="checkmark-option" :class="[
							{
								'checkmark-option-pointed': isPointed(option),
								'checkmark-option-selected': isSelected(option),
								'n-font-weight-heading': option.meta?.bold,
							},
						]"
					>
						<nord-icon name="interface-checked-small" size="s" />
						<div class="checkmark-option-content">
							<slot name="option-label" :option>
								<div class="n-truncate-2">{{ option.label }}</div>
							</slot>
						</div>
					</div>
				</slot>
			</template>

			<template #tag="{ option, handleTagRemove }: TagSlot">
				<div class="tag">
					<div class="tag-inner">{{ option.label }}</div>
					<button
						tabindex="-1"
						class="tag-remove"
						:aria-label="`Remove ${option.label}`"
						@click.prevent="handleTagRemove(option, $event)"
					>
						<nord-icon name="interface-close-small" size="xxs" />
					</button>
				</div>
			</template>

			<template #clear="{ clear }">
				<button
					tabindex="-1"
					class="clear"
					aria-label="Clear"
					@click.prevent="clear"
				>
					<nord-icon name="interface-close-small" size="xs" />
				</button>
				<div class="divider" />
			</template>

			<template #caret>
				<div class="caret">
					<nord-icon name="interface-dropdown-small" size="s" />
				</div>
			</template>

			<template #singlelabel="slotProps: SingleLabelSlot">
				<div class="multiselect-single-label">
					<slot name="singlelabel" v-bind="slotProps">
						<slot name="singlelabelIcon" />
						<span class="n-truncate">{{ slotProps.value?.label }}</span>
					</slot>
				</div>
			</template>

			<template #placeholder>
				<div class="placeholder">
					<div class="placeholder-text">{{ placeholder }}</div>
				</div>
			</template>

			<template #spinner>
				<div class="spinner"><nord-spinner /></div>
			</template>
		</Multiselect>

		<div
			v-show="error"
			:id="errorId"
			role="alert"
			class="n-caption n-error"
			:class="{
				'n-margin-bs-s': error,
			}"
		>
			{{ error }}
		</div>
	</div>
</template>

<style scoped>
/**
 * Same label styles from Provet Web components
 */
.label-container {
	display: inline-block;
	inline-size: fit-content;
}

.n-label {
	--n-color-text: var(--n-label-color);
}

.base-combobox {
	/* Override CSS Custom Properties of vueform/multiselect */

	--ms-font-size: var(--n-font-size-m);
	--ms-line-height: var(--n-line-height);
	--ms-bg: var(--n-color-active);
	--ms-bg-disabled: var(--n-color-active);
	--ms-border-color: var(--n-color-border-strong);
	--ms-border-width: 1px;
	--ms-border-color-active: var(--n-color-accent);
	--ms-border-width-active: 1px;
	--ms-radius: var(--n-border-radius-s);
	--ms-px: calc(var(--n-space-s) * 1.5);
	--ms-ring-width: 1px;
	--ms-ring-color: var(--n-color-accent);
	--ms-max-height: v-bind('maxHeight');
	--ms-tag-py: 0;
	--ms-tag-px: 0;
	--ms-tag-my: 0;
	--ms-tag-mx: 0;
	--ms-option-font-size: var(--n-font-size-m);
	--ms-option-line-height: var(--n-line-height);
	--ms-option-bg-pointed: var(--n-color-accent);
	--ms-option-color-pointed: var(--n-color-text-on-accent);
	--ms-option-bg-selected: var(--n-color-surface);
	--ms-option-color-selected: var(--n-color-text);
	--ms-option-bg-disabled: var(--n-color-surface);
	--ms-option-color-disabled: var(--n-color-text-weakest);
	--ms-option-bg-selected-pointed: var(--n-color-accent);
	--ms-option-color-selected-pointed: var(--n-color-text-on-accent);
	--ms-option-bg-selected-disabled: var(--n-color-surface);
	--ms-option-color-selected-disabled: var(--n-color-text-weaker);
	--ms-option-py: calc(var(--n-space-xs) * 1.5);
	--ms-option-px: calc(var(--n-space-s) + var(--n-space-xs) / 2);
	--ms-group-label-py: var(--n-space-s);
	--ms-group-label-px: calc(var(--n-space-s) + var(--n-space-xs) / 2);
	--ms-group-label-bg: var(--n-color-text-on-accent);
	--ms-group-label-color: var(--n-color-text-weaker);
	--ms-group-label-line-height: 1;
	--ms-empty-color: var(--n-color-text-weaker);

	/* Introduce CSS Custom Properties for overridden slots where they need to differ between sizes */

	--pc-combobox-clear-icon-size: var(--n-size-icon-xs);
	--pc-combobox-caret-icon-size: var(--n-size-icon-s);
	--pc-combobox-min-block-size: var(--n-space-xl);
	--pc-combobox-tags-padding: 3px;
	--pc-combobox-tag-min-block-size: 28px;
	--pc-combobox-tag-font-size: var(--n-font-size-s);
	--pc-combobox-tag-padding-inline-end: var(--n-space-xs);
	--pc-combobox-tag-remove-button-inline-size: calc(var(--n-space-l) + var(--n-space-xs));
	--pc-combobox-divider-block-size: var(--n-space-m);
	--pc-combobox-divider-padding: var(--n-space-s);

	inline-size: var(--n-input-inline-size, 240px);
}

.base-combobox.expand {
	inline-size: 100%;
}

/* Override CSS Custom Properties for different sizes and states */

.size-s {
	--ms-font-size: var(--n-font-size-s);
	--ms-px: calc(var(--n-space-xs) * 1.5);
	--pc-combobox-clear-icon-size: var(--n-size-icon-xxs);
	--pc-combobox-caret-icon-size: var(--n-size-icon-xs);
	--pc-combobox-min-block-size: calc(var(--n-space-l) + var(--n-space-xs));
	--pc-combobox-tags-padding: calc(var(--n-space-xs) / 2);
	--pc-combobox-tag-min-block-size: 22px;
	--pc-combobox-tag-font-size: var(--n-font-size-xs);
	--pc-combobox-tag-remove-button-inline-size: calc(var(--n-space-l) - (var(--n-space-xs) / 2));
	--pc-combobox-divider-block-size: calc(var(--n-space-s) + (var(--n-space-xs) / 2));
	--pc-combobox-divider-padding: var(--n-space-xs);
}

/* Hide the group options when there are no options */
:deep(.multiselect-options:empty) {
	display: none;
}

:deep(.multiselect-single-label) {
	/* Size of close button and dropdown icons with spaces */
	padding-inline-end: 60px;
}

.size-s .n-label {
	font-size: var(--n-font-size-s);
}

.size-s :deep(.multiselect-single-label) {
	/* Size of close button and dropdown icons with spaces */
	padding-inline-end: 46px;
}

.size-l {
	--ms-font-size: var(--n-font-size-l);
	--ms-radius: var(--n-border-radius);
	--pc-combobox-clear-icon-size: var(--n-size-icon-s);
	--pc-combobox-caret-icon-size: var(--n-size-icon-m);
	--pc-combobox-min-block-size: calc(var(--n-space-xxl) - var(--n-space-l));
	--pc-combobox-tag-min-block-size: 38px;
	--pc-combobox-tag-font-size: var(--n-font-size-m);
	--pc-combobox-tag-remove-button-inline-size: calc(var(--n-space-xl) + (var(--n-space-xs) / 2));
	--pc-combobox-divider-block-size: var(--n-space-l);
	--pc-combobox-divider-padding: calc(var(--n-space-s) + var(--n-space-xs));
}

.size-l :deep(.multiselect-single-label) {
	/* Size of close button and dropdown icons with spaces */
	padding-inline-end: 74px;
}

.invalid {
	--ms-border-color: var(--n-color-status-danger);
	--ms-border-color-active: var(--n-color-status-danger);
	--ms-ring-color: var(--n-color-status-danger);
}

/* Override vueform/multiselect styles where it's not possible with `--ms-*` CSS Custom Properties */

.multiselect {
	min-block-size: var(--pc-combobox-min-block-size);
}

.multiselect:hover {
	--ms-border-color: var(--n-color-border-hover);
}

.invalid .multiselect:hover {
	--ms-border-color: var(--n-color-status-danger);
}

.multiselect.is-disabled {
	pointer-events: none;
	cursor: auto;
	border: none;
}

:deep(.multiselect-wrapper) {
	min-block-size: calc(var(--pc-combobox-min-block-size) - (var(--ms-border-width) * 2));
}

:deep(.multiselect-wrapper input) {
	color: var(--n-color-text);
}

:deep(.multiselect.is-open),
:deep(.multiselect.is-open-top) {
	border-radius: var(--ms-radius);
}

:deep(.multiselect-dropdown) {
	inset-block-end: -2px;
	overflow-y: auto;
	background: var(--n-color-surface);
	border: none;
	border-radius: var(--n-border-radius-s);
	box-shadow: var(--n-box-shadow-popout);
}

:deep(.multiselect-dropdown.is-top) {
	inset-block: -2px auto;
}

:deep(.multiselect-tags) {
	gap: var(--pc-combobox-tags-padding);
	padding: var(--pc-combobox-tags-padding);
}

:deep(.multiselect-tags-search) {
	background: var(--ms-bg);
}

:deep(.multiselect-tags-search-wrapper) {
	margin-inline-start: calc(var(--ms-px) - var(--pc-combobox-tags-padding));
}

.has-selected :deep(.multiselect-tags-search-wrapper) {
	margin-inline-start: var(--ms-tag-my);
}

:deep(.multiselect-options) {
	padding: var(--n-space-s) 0;
}

:deep(.multiselect-option:active) {
	opacity: 0.8;
}

:deep(.multiselect-group-label) {
	font-size: var(--n-font-size-xs);
	font-weight: var(--n-font-weight-heading);
}

:deep(.multiselect-option.is-disabled) {
	cursor: default;
}

/* New styles for overridden slots */

.tag {
	position: relative;
	display: flex;
	gap: var(--n-space-s);
	align-items: center;
	min-block-size: var(--pc-combobox-tag-min-block-size);
	padding-inline: var(--n-space-s)
		calc(var(--pc-combobox-tag-padding-inline-end) + var(--pc-combobox-tag-remove-button-inline-size));
	font-size: var(--pc-combobox-tag-font-size);
	font-weight: var(--n-font-weight);
	line-height: var(--n-line-height);
	color: var(--n-color-text);
	pointer-events: auto !important;
	background: var(--n-color-button);
	border: 1px solid var(--n-color-border-strong);
	border-radius: var(--n-border-radius-s);
}

.tag-inner {
	flex: 1;
}

.tag-remove {
	position: absolute;
	inset-block: 0;
	inset-inline-end: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	inline-size: var(--pc-combobox-tag-remove-button-inline-size);
	color: var(--n-color-icon);
	cursor: pointer;
	background-color: transparent;
	border: none;
	border-radius: var(--n-border-radius-s);
}

.tag-remove:hover {
	color: var(--n-color-text);
	background-color: var(--n-color-button-hover);
}

.multiselect.is-disabled .tag,
.multiselect.is-disabled .tag-remove {
	pointer-events: none;
	cursor: auto;
}

.multiselect.is-disabled .tag {
	color: var(--n-color-text-weakest);
	background: var(--n-color-active);
	border: 1px solid var(--n-color-border);
}

.multiselect.is-disabled .tag-remove {
	color: var(--n-color-text-weakest);
}

.caret {
	display: flex;
	flex-grow: 0;
	flex-shrink: 0;
	margin: 0 var(--ms-px) 0 var(--pc-combobox-divider-padding);
	color: var(--n-color-icon);
	isolation: isolate;
}

.caret nord-icon {
	--_n-icon-size: var(--pc-combobox-caret-icon-size);
}

.multiselect.is-disabled .caret {
	color: var(--n-color-text-weakest);
}

.divider {
	min-block-size: var(--pc-combobox-divider-block-size);
	border-inline-start: 1px solid var(--n-color-border);
	isolation: isolate;
}

.clear {
	display: flex;
	flex-grow: 0;
	flex-shrink: 0;
	padding: var(--n-space-s);
	margin-inline-end: calc(var(--pc-combobox-divider-padding) - calc(var(--n-space-xs) * 1.5));
	color: var(--n-color-icon);
	cursor: pointer;
	background: transparent;
	isolation: isolate;
}

:deep(.clear nord-icon) {
	--_n-icon-size: var(--pc-combobox-clear-icon-size);

	max-width: var(--_n-icon-size);
	max-height: var(--_n-icon-size);
}

.clear:hover {
	color: var(--n-color-icon-hover);
}

.multiselect.is-disabled .clear {
	color: var(--n-color-text-weakest);
}

.spinner {
	display: flex;
	align-items: center;
	padding-inline-end: calc(var(--n-space-s) + (var(--n-space-xs) / 2));
	border-inline-end: 1px solid var(--n-color-border);
}

.checkmark-option {
	display: flex;
	gap: var(--n-space-s);
	align-items: center;
	inline-size: 100%;
}

.checkmark-option nord-icon {
	visibility: hidden;
	color: var(--n-color-accent);
}

.checkmark-option-selected nord-icon {
	visibility: visible;
}

.checkmark-option-pointed nord-icon {
	color: currentcolor;
}

.checkmark-option-content {
	flex: 1;

	/* Minus width of icon and padding */
	max-inline-size: calc(100% - 20px);
	word-wrap: break-word;
}

.placeholder {
	position: absolute;
	inset-block-start: 0;
	inset-inline-start: 0;
	box-sizing: border-box;
	display: flex;
	align-items: center;
	inline-size: 100%;
	max-inline-size: 100%;
	block-size: 100%;
	padding-inline: var(--ms-px) calc(1.25rem + var(--ms-px) * 3);
	line-height: var(--ms-line-height);
	color: var(--n-color-text-weakest);
	pointer-events: none;
	background: transparent;
}

.placeholder-text {
	display: block;
	max-inline-size: 100%;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
</style>
