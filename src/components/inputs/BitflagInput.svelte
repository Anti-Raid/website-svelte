<script lang="ts">
	import { BitFlag } from '$lib/bitflag';
	import logger from '$lib/ui/logger';
	import SelectMulti from './select/SelectMulti.svelte';

	export let flagDescriptors: { [key: string]: number };
	export let selectedFlags: string;
	export let id: string;

	let selectedOptions: string[] = [];

	const setNewFlags = () => {
		let bitflagClass = new BitFlag(flagDescriptors, '0');

		for (let perm of selectedOptions) {
			bitflagClass.setFlag(perm, true);
		}

		let newFlags = bitflagClass.getFlags().toString();

		// Avoid an infinite loop
		if (newFlags !== selectedFlags) {
			selectedFlags = newFlags;
		}
	};

	const updateSelectedFlags = () => {
		logger.info('updateSelectedFlags', selectedFlags);
		let bitflagClass = new BitFlag(flagDescriptors, selectedFlags);

		let flags = bitflagClass.getSetFlags();

		selectedOptions = Object.values(flags);
	};

	$: selectedFlags, updateSelectedFlags();
	$: selectedOptions, setNewFlags();
</script>

<SelectMulti
	{id}
	label="Select Permissions"
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
