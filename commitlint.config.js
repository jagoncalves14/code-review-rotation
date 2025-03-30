/**
 * feat：New features
 * fix：Fix defects
 * docs：Documentation updates
 * style：Code modifications that do not affect the program logic (modify whitespace characters, format indentation, complete missing semicolons, etc., without changing the code logic)
 * refactor：Refactoring
 * perf：Performance improvements
 * test：Test related
 * build：Build related
 * ci：Continuous integration
 * chore：Other types that do not belong to the above types, such as build process, dependency management
 * revert：Fallback code
 */
/** @type {import('cz-git').UserConfig} */
export default {
	extends: ['@commitlint/config-conventional'],
	rules: {
		'body-leading-blank': [2, 'always'],
		'footer-leading-blank': [1, 'always'],
		'subject-empty': [2, 'never'],
		'type-empty': [2, 'never'],
		'subject-case': [0, 'never'],
		'type-enum': [
			2,
			'always',
			['feat', 'fix', 'perf', 'style', 'docs', 'test', 'refactor', 'build', 'ci', 'chore', 'revert', 'release'],
		],
	},
	prompt: {
		messages: {
			type: 'Select the type of submission you want to submit:',
			scope: 'Select a submission scope (optional):',
			customScope: 'Please enter a custom submission range:',
			subject: 'Fill in a short and concise description of the change:\n',
			body: 'Fill in a more detailed description of the change (optional). Use "|" to wrap:\n',
			breaking: 'List non-compatible breaking changes (optional). Use "|" to wrap:\n',
			footerPrefixsSelect: 'Select the associated issue prefix (optional):',
			customFooterPrefixs: 'Enter a custom issue prefix:',
			footer: 'List related issues (optional) For example: #31, #I3244:\n',
			confirmCommit: 'Submit or modify the commit?',
		},
		types: [
			{ value: 'feat', name: 'feat | A new feature' },
			{ value: 'fix', name: 'fix | A bug fix' },
			{ value: 'docs', name: 'docs | Documentation only changes' },
			{ value: 'style', name: 'style | Changes that do not affect the meaning of the code' },
			{ value: 'refactor', name: 'refactor | A code change that neither fixes a bug nor adds a feature' },
			{ value: 'perf', name: 'perf | A code change that improves performance' },
			{ value: 'test', name: 'test | Adding missing tests or correcting existing tests' },
			{ value: 'build', name: 'build | Changes that affect the build system or external dependencies' },
			{ value: 'ci', name: 'ci | Changes to our CI configuration files and scripts' },
			{ value: 'revert', name: 'revert | Revert to a commit' },
			{ value: 'chore', name: 'chore | Other changes that do not modify src or test files' },
		],
		useEmoji: false,
		emojiAlign: 'center',
		allowCustomIssuePrefixs: false,
		allowEmptyIssuePrefixs: false,
	},
}
