<script lang="ts">
	import { BitFlag } from '$lib/bitflag';
	import logger from '$lib/ui/logger';
	import RawSelectMulti from './select/RawSelectMulti.svelte';

	export let flagDescriptors: { [key: string]: string | number };
	export let selectedFlags: string;
	export let id: string;

	let selectedOptions: string[] = [];

	const setNewFlags = () => {
		let bitflagClass = new BitFlag(flagDescriptors, '0');
		for (let perm of selectedOptions) bitflagClass.setFlag(perm, true);

		let newFlags = bitflagClass.getFlags().toString();
		if (newFlags !== selectedFlags) selectedFlags = newFlags;
	};

	const updateSelectedFlags = () => {
		logger.info('updateSelectedFlags', selectedFlags);

		let bitflagClass = new BitFlag(flagDescriptors, selectedFlags || '0');
		let flags = bitflagClass.getSetFlags();
		selectedOptions = Object.values(flags);
	};

	$: selectedFlags, updateSelectedFlags();
	$: selectedOptions, setNewFlags();
</script>

<RawSelectMulti
	{id}
	choices={Object.entries(flagDescriptors).map(([name, permission]) => ({
		id: permission.toString(),
		value: permission.toString(),
		label: name
	}))}
	bind:value={selectedOptions}
	required={true}
	disabled={false}
	defaultLabel="Select an action"
/>
