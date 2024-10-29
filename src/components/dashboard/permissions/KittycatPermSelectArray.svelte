<script lang="ts">
	import BoxButton from '../../inputs/button/BoxButton.svelte';
	import { CommonPermissionContext } from './commonPermissionContext';
	import KittycatPermSelector from './KittycatPermSelector.svelte';

	export let perms: string[] = [];
	export let ctx: CommonPermissionContext;
	export let id: string;
</script>

<section {id} class="kittycat-perm-select-array mb-2">
	{#if perms?.length == 0}
		<BoxButton
			onClick={() => {
				perms = [...perms, ''];
			}}>Add Permission</BoxButton
		>
	{/if}

	{#each perms as perm, i}
		<KittycatPermSelector {ctx} bind:perm />

		<div class="flex flex-row mt-1">
			<BoxButton
				onClick={() => {
					perms = [...perms.slice(0, i + 1), '', ...perms.slice(i + 1)];
				}}>Add Permission</BoxButton
			>
			<div class="mr-2" />
			<BoxButton
				onClick={() => {
					perms = perms.filter((_, index) => index !== i);
				}}>Remove Permission</BoxButton
			>
		</div>
	{/each}
</section>
