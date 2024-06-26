<script lang="ts">
	import BoxButton from '../inputs/button/BoxButton.svelte';
	import KittycatPermSelector from './KittycatPermSelector.svelte';

	export let perms: string[] = [];
	export let id: string;
</script>

<section {id} class="kittycat-perm-select-array mb-2">
	{#if perms?.length == 0}
		<BoxButton
			onclick={() => {
				perms = [...perms, ''];
			}}>Add Permission</BoxButton
		>
	{/if}

	{#each perms as perm, i}
		<KittycatPermSelector bind:perm />

		<div class="flex flex-row mt-1">
			<BoxButton
				onclick={() => {
					perms = [...perms.slice(0, i + 1), '', ...perms.slice(i + 1)];
				}}>Add Permission</BoxButton
			>
			<div class="mr-2" />
			<BoxButton
				onclick={() => {
					perms = perms.filter((_, index) => index !== i);
				}}>Remove Permission</BoxButton
			>
		</div>
	{/each}
</section>
