<script lang="ts">
	import BitflagInput from '../../inputs/BitflagInput.svelte';
	import serenityPermissions from '$lib/generated/build_assets/serenity_perms.json';

	export let nativePerms: string;
	export let id: string;
</script>

<BitflagInput
	label="Select Permissions"
	{id}
	bind:selectedFlags={nativePerms}
	flagDescriptors={serenityPermissions}
/>
