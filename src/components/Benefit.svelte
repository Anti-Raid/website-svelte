<script lang="ts">
	import Icon from '@iconify/svelte';

	export let icon: string;
	export let title: string;
	export let className: string = '';
</script>

<div
	class="block bg-surface-800/90 hover:bg-surface-800/50 px-2 py-4 rounded-md {className}"
>
	<dt>
		<div
			class="absolute flex h-12 w-12 items-center justify-center rounded-md bg-surface-400 text-white"
		>
			<Icon {icon} class="text-2xl" />
		</div>
		<p class="ml-16 text-xl font-cabin font-extrabold leading-6 text-white">{title}</p>
	</dt>

	<dd class="mt-2 ml-16 text-white text-monster">
		<slot />
	</dd>
</div>
