// @ts-check
const { skeleton } = require('@skeletonlabs/tw-plugin');

/** @type {import('tailwindcss').Config}*/
const config = {
	mode: 'jit',
	important: true,
	content: [
		'./src/**/*.{html,js,svelte,ts}',
		require('path').join(require.resolve('@skeletonlabs/skeleton'), '../**/*.{html,js,svelte,ts}')
	],
	darkMode: 'class',
	theme: {
		extend: {
			hueRotate: {
				0: 'var(--500)'
			},
			colors: {
				// Reed
				dark: '#16151d',
				waohhh: '#000000',
				cards: '#191919',
				carrd: '#000000',
				violet_samp: 'rgba(139, 92, 246, .50)',
				blue_samp: 'rgba(59, 130, 246, .50)',
				emerald_samp: 'rgba(16, 185, 129, .50)',
				rose_samp: 'rgba(239, 68, 68, .50)',
				summer_samp: 'rgb(250, 95, 100)',
				themable_samp: 'rgba(245, 158, 11, .50)',
				modes: {
					dark: '#16151d',
					light: ''
				},
				themable: {
					...Array.from({ length: 10 }).reduce((obj, val, index) => {
						const tone = index == 0 ? '50' : String(index * 100);
						const tones = Array.from({ length: 10 }).reduce((_obj, _val, _index) => {
							const _tone = String(_index) + (_index != 0 ? '0' : '');
							_obj[tone + '/' + _tone] = `var(--${tone}-${_tone})`;
							return _obj;
						}, {});
						obj = {
							...tones,
							...obj
						};
						return obj;
					}, {}),
					900: 'var(--900)',
					800: 'var(--800)',
					700: 'var(--700)',
					600: 'var(--600)',
					500: 'var(--500)',
					400: 'var(--400)',
					300: 'var(--300)',
					200: 'var(--200)',
					100: 'var(--100)',
					50: 'var(--50)'
				}
			}
		}
	},
	variants: {
		extend: {}
	},
	plugins: [
		require('@tailwindcss/typography'),
		require('@tailwindcss/forms'),
		require('tailwindcss-animate'),
		skeleton({
			themes: {
				custom: [
					{
						name: 'violet',
						properties: {
							// =~= Theme Properties =~=
							'--theme-font-family-base': `system-ui`,
							'--theme-font-family-heading': `system-ui`,
							'--theme-font-color-base': '0 0 0',
							'--theme-font-color-dark': '255 255 255',
							'--theme-rounded-base': '9999px',
							'--theme-rounded-container': '8px',
							'--theme-border-base': '1px',
							// =~= Theme On-X Colors =~=
							'--on-primary': '0 0 0',
							'--on-secondary': '0 0 0',
							'--on-tertiary': '255 255 255',
							'--on-success': '0 0 0',
							'--on-warning': '0 0 0',
							'--on-error': '255 255 255',
							'--on-surface': '255 255 255',
							// =~= Theme Colors  =~=
							// primary | #bb71d2
							'--color-primary-50': '245 234 248', // #f5eaf8
							'--color-primary-100': '241 227 246', // #f1e3f6
							'--color-primary-200': '238 220 244', // #eedcf4
							'--color-primary-300': '228 198 237', // #e4c6ed
							'--color-primary-400': '207 156 224', // #cf9ce0
							'--color-primary-500': '187 113 210', // #bb71d2
							'--color-primary-600': '168 102 189', // #a866bd
							'--color-primary-700': '140 85 158', // #8c559e
							'--color-primary-800': '112 68 126', // #70447e
							'--color-primary-900': '92 55 103', // #5c3767
							// secondary | #f3ea2b
							'--color-secondary-50': '253 252 223', // #fdfcdf
							'--color-secondary-100': '253 251 213', // #fdfbd5
							'--color-secondary-200': '252 250 202', // #fcfaca
							'--color-secondary-300': '250 247 170', // #faf7aa
							'--color-secondary-400': '247 240 107', // #f7f06b
							'--color-secondary-500': '243 234 43', // #f3ea2b
							'--color-secondary-600': '219 211 39', // #dbd327
							'--color-secondary-700': '182 176 32', // #b6b020
							'--color-secondary-800': '146 140 26', // #928c1a
							'--color-secondary-900': '119 115 21', // #777315
							// tertiary | #98136d
							'--color-tertiary-50': '240 220 233', // #f0dce9
							'--color-tertiary-100': '234 208 226', // #ead0e2
							'--color-tertiary-200': '229 196 219', // #e5c4db
							'--color-tertiary-300': '214 161 197', // #d6a1c5
							'--color-tertiary-400': '183 90 153', // #b75a99
							'--color-tertiary-500': '152 19 109', // #98136d
							'--color-tertiary-600': '137 17 98', // #891162
							'--color-tertiary-700': '114 14 82', // #720e52
							'--color-tertiary-800': '91 11 65', // #5b0b41
							'--color-tertiary-900': '74 9 53', // #4a0935
							// success | #158c74
							'--color-success-50': '220 238 234', // #dceeea
							'--color-success-100': '208 232 227', // #d0e8e3
							'--color-success-200': '197 226 220', // #c5e2dc
							'--color-success-300': '161 209 199', // #a1d1c7
							'--color-success-400': '91 175 158', // #5baf9e
							'--color-success-500': '21 140 116', // #158c74
							'--color-success-600': '19 126 104', // #137e68
							'--color-success-700': '16 105 87', // #106957
							'--color-success-800': '13 84 70', // #0d5446
							'--color-success-900': '10 69 57', // #0a4539
							// warning | #f61d42
							'--color-warning-50': '254 221 227', // #fedde3
							'--color-warning-100': '253 210 217', // #fdd2d9
							'--color-warning-200': '253 199 208', // #fdc7d0
							'--color-warning-300': '251 165 179', // #fba5b3
							'--color-warning-400': '249 97 123', // #f9617b
							'--color-warning-500': '246 29 66', // #f61d42
							'--color-warning-600': '221 26 59', // #dd1a3b
							'--color-warning-700': '185 22 50', // #b91632
							'--color-warning-800': '148 17 40', // #941128
							'--color-warning-900': '121 14 32', // #790e20
							// error | #222b4d
							'--color-error-50': '222 223 228', // #dedfe4
							'--color-error-100': '211 213 219', // #d3d5db
							'--color-error-200': '200 202 211', // #c8cad3
							'--color-error-300': '167 170 184', // #a7aab8
							'--color-error-400': '100 107 130', // #646b82
							'--color-error-500': '34 43 77', // #222b4d
							'--color-error-600': '31 39 69', // #1f2745
							'--color-error-700': '26 32 58', // #1a203a
							'--color-error-800': '20 26 46', // #141a2e
							'--color-error-900': '17 21 38', // #111526
							// surface | #c82a41
							'--color-surface-50': '247 223 227', // #f7dfe3
							'--color-surface-100': '244 212 217', // #f4d4d9
							'--color-surface-200': '241 202 208', // #f1cad0
							'--color-surface-300': '233 170 179', // #e9aab3
							'--color-surface-400': '217 106 122', // #d96a7a
							'--color-surface-500': '200 42 65', // #c82a41
							'--color-surface-600': '180 38 59', // #b4263b
							'--color-surface-700': '150 32 49', // #962031
							'--color-surface-800': '120 25 39', // #781927
							'--color-surface-900': '98 21 32' // #621520
						}
					}
				]
			}
		})
	]
};

module.exports = config;
