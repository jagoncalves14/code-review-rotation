module.exports = {
	root: true,
	plugins: ['stylelint-order'],
	extends: [
		'stylelint-config-standard-scss', // Configuration for SCSS files.
		'stylelint-config-standard', // The standard shareable config for Stylelint
		'stylelint-config-html/html', // The shareable html config for Stylelint.
		'stylelint-config-html/vue', // The shareable vue config for Stylelint.
		'stylelint-config-recess-order', // Use the clean order for properties.
	],
	rules: {
		// Custom property pattern - allows for custom properties to be used in the code
		'custom-property-pattern': '^_?([a-z][a-z0-9]*)(-[a-z0-9]+)*$',
		// Disable low-specificity selectors after overriding high-specificity selectors
		'no-descending-specificity': null,
		// Empty source code is prohibited
		'no-empty-source': null,
		// Missing generic family keyword in suppressed font family
		'font-family-no-missing-generic-family-keyword': null,
		// Disallow unknown @ rules
		'at-rule-no-unknown': [
			true,
			{
				ignoreAtRules: [
					'tailwind',
					'apply',
					'variants',
					'responsive',
					'screen',
					'function',
					'if',
					'each',
					'include',
					'mixin',
					'extend',
					'content',
					'use',
				],
			},
		],
		// Unknown functions are not allowed
		'function-no-unknown': null,
		// Unknown units not allowed
		'unit-no-unknown': [true, { ignoreUnits: ['rpx'] }],
		// Mark unknown property value in CSS specification
		'declaration-property-value-no-unknown': true,
		// Do not allow selectors to use vendor prefixes
		'selector-no-vendor-prefix': null,
		// Pattern for specifying keyframe names
		'keyframes-name-pattern': null,
		// Specify the mode of the class selector
		'selector-id-pattern': [
			'^$|[a-z0-9]+(-[a-z0-9]+)*(__nuxt|$)',
		],
		// Values of properties that can be inherited are prohibited from being specified as !important
		'value-no-vendor-prefix': null,
		// Require or disallow blank lines before rules
		'rule-empty-line-before': ['always', { ignore: ['after-comment', 'first-nested'] }],
	},
	ignoreFiles: ['**/*.js', '**/*.jsx', '**/*.tsx', '**/*.ts'],
	overrides: [
		{
			files: ['**/*.(css|html|vue)'],
			customSyntax: 'postcss-html',
			rules: {
				// Disable unknown pseudo-class selectors
				'selector-pseudo-class-no-unknown': [true, { ignorePseudoClasses: ['deep', 'global'] }],
				// Disable unknown pseudo-element selectors
				'selector-pseudo-element-no-unknown': [true, { ignorePseudoElements: ['v-deep', 'v-global', 'v-slotted'] }],
			},
		},
	],
}
