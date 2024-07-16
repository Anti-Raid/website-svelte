// @ts-check
const { skeleton } = require('@skeletonlabs/tw-plugin');

/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: 'class',
	content: [
		'./src/**/*.{html,js,svelte,ts}',
		require('path').join(require.resolve('@skeletonlabs/skeleton'), '../**/*.{html,js,svelte,ts}')
	],
	theme: {
		extend: {}
	},
	plugins: [
		require('@tailwindcss/forms'),
		skeleton({
			themes: {
				preset: [
					'skeleton',
					'wintry',
					'modern',
					'rocket',
					'seafoam',
					'vintage',
					'sahara',
					'hamlindigo',
					'gold-nouveau',
					'crimson'
				]
			}
		})
	]
};
