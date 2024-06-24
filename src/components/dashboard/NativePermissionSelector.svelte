<script lang="ts">
	import serenityPermissions from '$lib/generated/rust/serenity_perms.json';
	import { BitFlag } from '$lib/bitflag';
	import BoolInput from '../inputs/BoolInput.svelte';

	export let nativePerms: string = '0';
	export let id: string;

	let selectedPermissions: number[] = [];

	const setNewNativePerms = () => {
		let bitflagClass = new BitFlag(serenityPermissions, '0');

		for (let perm of selectedPermissions) {
			bitflagClass.setFlag(perm, true);
		}

		nativePerms = bitflagClass.getFlags().toString();
	};

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
						value={selectedPermissions.includes(permission)}
						onChange={(value) => {
							if (value) {
								selectedPermissions = [...selectedPermissions, permission];
							} else {
								selectedPermissions = selectedPermissions.filter((perm) => perm !== permission);
							}

							setNewNativePerms();
						}}
					/>
				</div>
			</div>
		{/if}
	{/each}
</div>
