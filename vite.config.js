import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { exec } from 'child_process';
import { promisify } from 'util';
import pkg from './package.json';

// Get current tag/commit and last commit date from git
const pexec = promisify(exec);
let [version, lastmod] = (
	await Promise.allSettled([
		pexec('git describe --tags || git rev-parse --short HEAD'),
		pexec('git log -1 --format=%cd --date=format:"%Y-%m-%d %H:%M"')
	])
)
	// @ts-ignore
	.map((v) => JSON.stringify(v.value?.stdout.trim()));

export default defineConfig({
	plugins: [sveltekit()],
	define: {
		I_NODE_ENV: `"${process.env.NODE_ENV}"`,
		I_COMMIT: version,
		I_LAST_MOD: lastmod,
		I_VERSION: `"${pkg?.version}"`
	},
	build: {
		sourcemap: true
	},
	optimizeDeps: {
		exclude: [
			'codemirror',
			'@codemirror/view',
			'@codemirror/state',
			'@codemirror/commands',
			'@codemirror/language',
			'@codemirror/legacy-modes/mode/lua',
			'@codemirror/theme-one-dark'
		]
	}
});
