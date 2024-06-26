<script lang="ts">
	import PermissionCheck from './PermissionCheck.svelte';
	import { PermissionCheck as PCT } from '$lib/generated/silverpelt';
	import BoxButton from '../inputs/button/BoxButton.svelte';

	export let perms: PCT[] = [];
	export let id: string;
</script>

<section {id} class="kittycat-perm-select-array mb-2">
	{#if perms?.length == 0}
		<BoxButton
			text="Add Permission Check"
			onclick={() => {
				perms = [
					...perms,
					{ kittycat_perms: [], native_perms: [], outer_and: false, inner_and: false }
				];
			}}
		/>
	{/if}

	{#each perms as perm, i}
		<PermissionCheck id={`${id}-${i}`} bind:permissionCheck={perm} />

		<div class="flex flex-row mt-1">
			<BoxButton
				text="Add Permission Check"
				onclick={() => {
					perms = [
						...perms.slice(0, i + 1),
						{ kittycat_perms: [], native_perms: [], outer_and: false, inner_and: false },
						...perms.slice(i + 1)
					];
				}}
			/>
			<div class="mr-2" />
			<BoxButton
				text="Remove Permission Check"
				onclick={() => {
					perms = perms.filter((_, index) => index !== i);
				}}
			/>
		</div>
	{/each}
</section>
