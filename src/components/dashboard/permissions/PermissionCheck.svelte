<script lang="ts">
	import { PermissionCheck } from '$lib/generated/silverpelt';
	import BoolInput from '../../inputs/BoolInput.svelte';
	import { CommonPermissionContext } from './commonPermissionContext';
	import KittycatPermSelectArray from './KittycatPermSelectArray.svelte';
	import NativePermissionSelectArray from './NativePermissionSelectArray.svelte';

	export let permissionCheck: PermissionCheck;
	export let ctx: CommonPermissionContext;
	export let id: string;
</script>

<section class="permission-check">
	<div class="permission-check__content">
		<details class="permission-check__details border p-2 bg-black hover:bg-slate-900">
			<summary class="permission-check__summary hover:cursor-pointer">Kittycat Permissions</summary>
			<KittycatPermSelectArray
				{ctx}
				bind:perms={permissionCheck.kittycat_perms}
				id={`permission-check__ksa-${id}`}
			/>
		</details>
		<details class="permission-check__details border p-2 bg-black hover:bg-slate-900">
			<summary class="permission-check__summary hover:cursor-pointer">Native Permissions</summary>
			<NativePermissionSelectArray
				bind:perms={permissionCheck.native_perms}
				id={`permission-check__na-${id}`}
			/>
		</details>
		<details class="permission-check__details border p-2 bg-black hover:bg-slate-900">
			<summary class="permission-check__details hover:cursor-pointer">Conditions</summary>
			<BoolInput
				id={`permission-check__inner-and-${id}`}
				label="Inner And"
				description="Whether or not the permissions are ANDed (all needed) or OR'd (at least one needed)"
				bind:value={permissionCheck.inner_and}
				disabled={false}
				onChange={() => {}}
			/>
		</details>
	</div>
</section>
