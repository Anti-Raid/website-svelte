<script lang="ts">
	import serenityPermissions from '$lib/generated/rust/serenity_perms.json';
	import { BitFlag } from '$lib/bitflag';
	import BoolInput from '../../inputs/BoolInput.svelte';
	import logger from '$lib/ui/logger';

	export let nativePerms: string;
	export let id: string;

	let selectedPermissions: string[] = [];

	const setNewNativePerms = () => {
		let bitflagClass = new BitFlag(serenityPermissions, '0');

		for (let perm of selectedPermissions) {
			bitflagClass.setFlag(perm, true);
		}

		let newPerms = bitflagClass.getFlags().toString();

		// Avoid an infinite loop
		if (newPerms !== nativePerms) {
			nativePerms = newPerms;
		}
	};

	const updateSelectedPerms = () => {
		logger.info('updateSelectedPerms', nativePerms);
		let bitflagClass = new BitFlag(serenityPermissions, nativePerms);

		let flags = bitflagClass.getSetFlags();

		selectedPermissions = Object.values(flags);
	};

	$: nativePerms, updateSelectedPerms();
	$: selectedPermissions, setNewNativePerms();
</script>

<div
	class="native-permission-selector grid gap-2 grid-rows-auto grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
>
	{#each Object.entries(serenityPermissions) as [name, permission]}
		{#if name != ''}
			<div class="self-auto">
				<div class="inline-grid">
					<BoolInput
						id={id + '-' + name.replaceAll(' ', '_').toLowerCase()}
						label={name}
						description={`Toggle '${name}'`}
						disabled={false}
						value={selectedPermissions.includes(permission.toString())}
						onChange={(value) => {
							if (value) {
								selectedPermissions = [...selectedPermissions, permission.toString()];
							} else {
								selectedPermissions = selectedPermissions.filter(
									(perm) => perm.toString() !== permission.toString()
								);
							}

							setNewNativePerms();
						}}
					/>
				</div>
			</div>
		{/if}
	{/each}
</div>
