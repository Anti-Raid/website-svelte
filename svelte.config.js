import adapter from '@sveltejs/adapter-cloudflare';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),
		alias: {
			'@components': './src/components',
			'@lib': './src/lib'
		}
	},
	preprocess: [
		preprocess({
			postcss: true
		})
	]
};

export default config;
