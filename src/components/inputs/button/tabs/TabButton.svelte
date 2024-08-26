<!--
From Infinity-Next commit 8cd768e5abb0a00889fcf8309e37fbbe93613c2c 

filename: src/components/layouts/Button.tsx

Converted to SvelteKit from NextJS for panel use

=> Tab buttons
-->

<script lang="ts">
	import logger from '$lib/ui/logger';

	export let visible: boolean;
	export let text: string;
	export let onClick: () => void;
</script>

<button
	type="button"
	class="text-sm {!visible
		? 'text-surface-600 font-bold border-b-2 hover:opacity-80'
		: 'text-surface-400 font-bold border-b-4 hover:opacity-80'}"
	on:click={(evt) => {
		logger.info('TabButton.switchImpl', text);
		if (evt && evt.preventDefault) evt.preventDefault();

		onClick();
	}}
	disabled={false}
>
	<span class={visible ? 'opacity-60' : ''}>{text}</span>
</button>
