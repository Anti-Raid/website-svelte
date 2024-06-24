<script lang="ts">
	import PermissionCheck from './PermissionCheck.svelte';
	import { PermissionCheck as PCT } from '$lib/generated/silverpelt';

	export let perms: PCT[] = [];
	export let id: string;
</script>

<section {id} class="kittycat-perm-select-array mb-2">
	{#if perms?.length == 0}
		<button
			class="bg-primary-600 hover:bg-primary-400 p-3"
			on:click={() => {
				perms = [
					...perms,
					{ kittycat_perms: [], native_perms: [], outer_and: false, inner_and: false }
				];
			}}>Add Permission</button
		>
	{/if}

	{#each perms as perm, i}
		<PermissionCheck id={`${id}-${i}`} bind:permissionCheck={perm} />

		<div class="flex flex-row">
			<button
				class="bg-primary-600 hover:bg-primary-400 p-3 mr-2"
				on:click={() => {
					perms = [
						...perms.slice(0, i + 1),
						{ kittycat_perms: [], native_perms: [], outer_and: false, inner_and: false },
						...perms.slice(i + 1)
					];
				}}>Add Permission Check</button
			>
			<button
				class="bg-red-600 hover:bg-red-400 p-3"
				on:click={() => {
					perms = perms.filter((_, index) => index !== i);
				}}>Remove Permission Check</button
			>
		</div>
	{/each}
</section>
