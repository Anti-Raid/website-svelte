<script lang="ts">
	import BoxButton from '../inputs/button/BoxButton.svelte';
	import NativePermissionSelector from './NativePermissionSelector.svelte';

	export let perms: string[] = [];
	export let id: string;
</script>

<section {id} class="kittycat-perm-select-array mb-2">
	{#if perms?.length == 0}
		<BoxButton
			text="Add Permission"
			onclick={() => {
				perms = [...perms, ''];
			}}
		/>
	{/if}

	{#each perms as perm, i}
		<NativePermissionSelector id={`${id}-${i}`} bind:nativePerms={perm} />

		<div class="flex flex-row">
			<BoxButton
				text="Add Permission"
				onclick={() => {
					perms = [...perms.slice(0, i + 1), '', ...perms.slice(i + 1)];
				}}
			/>
			<div class="mr-2" />
			<BoxButton
				text="Remove Permission"
				onclick={() => {
					perms = perms.filter((_, index) => index !== i);
				}}
			/>
		</div>
	{/each}
</section>
