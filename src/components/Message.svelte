<script lang="ts">
	import Icon from '@iconify/svelte';

	export let big = false;
	export let type: 'loading' | 'info' | 'error' | 'success';

	let icon = '';
	let color = '';
	let extClass = '';
	let iconClass = '';
	if (type === 'loading') {
		icon = 'loading';
		color = 'white';
		iconClass = 'animate-spin';
	}
	if (type === 'info') {
		icon = 'information';
		color = 'blue';
	}
	if (type === 'error') {
		icon = 'alert';
		color = 'red';
	}
	if (type === 'success') {
		icon = 'check';
		color = 'green';
	}
</script>

<div
	class="mt-4 font-cabin font-medium text-{color}{color === 'white' ? '' : '-500'} text-{big
		? '4xl text-center'
		: '2xl'} {extClass || ''}"
>
	<Icon
		icon="mdi:{icon}"
		class="{big ? 'block m-auto ' : 'inline-block text-2xl'} {iconClass || ''}"
	/>
	<slot />
</div>
