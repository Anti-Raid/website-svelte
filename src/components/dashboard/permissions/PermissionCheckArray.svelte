<script lang="ts">
	import PermissionCheck from './PermissionCheck.svelte';
	import { PermissionCheck as PCT } from '$lib/generated/silverpelt';
	import BoxButton from '../../inputs/button/BoxButton.svelte';
	import { CommonPermissionContext } from './commonPermissionContext';

	export let ctx: CommonPermissionContext;
	export let perms: PCT[] = [];
	export let id: string;
</script>

<section {id} class="kittycat-perm-select-array mb-2">
	{#if perms?.length == 0}
		<BoxButton
			onclick={() => {
				perms = [
					...perms,
					{ kittycat_perms: [], native_perms: [], outer_and: false, inner_and: false }
				];
			}}>Add Permission Check</BoxButton
		>
	{/if}

	{#each perms as perm, i}
		<div class="permission_check_array__check px-2 mt-2">
			<PermissionCheck id={`${id}-${i}`} bind:permissionCheck={perm} {ctx} />

			<div class="flex flex-row mt-1">
				<BoxButton
					onclick={() => {
						perms = [
							...perms.slice(0, i + 1),
							{ kittycat_perms: [], native_perms: [], outer_and: false, inner_and: false },
							...perms.slice(i + 1)
						];
					}}>Add Permission Check</BoxButton
				>
				<div class="mr-2" />
				<BoxButton
					onclick={() => {
						perms = perms.filter((_, index) => index !== i);
					}}>Remove Permission Check</BoxButton
				>
			</div>
		</div>
	{/each}
</section>
