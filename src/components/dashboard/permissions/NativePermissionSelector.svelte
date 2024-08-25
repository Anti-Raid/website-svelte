<script lang="ts">
	import BitflagInput from '../../inputs/BitflagInput.svelte';
	import serenityPermissions from '$lib/generated/build_assets/serenity_perms.json';
	import Label from '../../inputs/Label.svelte';

	export let nativePerms: string;
	export let id: string;
</script>

<Label {id} label="Select Permissions" />
<BitflagInput {id} bind:selectedFlags={nativePerms} flagDescriptors={serenityPermissions} />
