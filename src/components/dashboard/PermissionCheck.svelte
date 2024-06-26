<script lang="ts">
	import { PermissionCheck } from '$lib/generated/silverpelt';
	import BoolInput from '../inputs/BoolInput.svelte';
	import KittycatPermSelectArray from './KittycatPermSelectArray.svelte';
	import NativePermissionSelectArray from './NativePermissionSelectArray.svelte';

	/*
type PermissionCheck struct {
	KittycatPerms []string           `json:"kittycat_perms"` // The kittycat permissions needed to run the command
	NativePerms   []NativePermission `json:"native_perms"`   // The native permissions needed to run the command (converted from serenity::all::Permissions)
	OuterAnd      bool               `json:"outer_and"`      // Whether the next permission check should be ANDed (all needed) or OR'd (at least one) to the current
	InnerAnd      bool               `json:"inner_and"`      // Whether or not the perms are ANDed (all needed) or OR'd (at least one)
}
    */
	export let permissionCheck: PermissionCheck;
	export let id: string;
</script>

<section class="permission-check">
	<div class="permission-check__content">
		<details class="permission-check__details border p-2" open>
			<summary class="permission-check__summary hover:cursor-pointer">Kittycat Permissions</summary>
			<KittycatPermSelectArray
				bind:perms={permissionCheck.kittycat_perms}
				id={`permission-check__ksa-${id}`}
			/>
		</details>
		<details class="permission-check__details border p-2" open>
			<summary class="permission-check__summary hover:cursor-pointer">Native Permissions</summary>
			<NativePermissionSelectArray
				bind:perms={permissionCheck.native_perms}
				id={`permission-check__na-${id}`}
			/>
		</details>
		<details class="permission-check__details border p-2" open>
			<BoolInput
				id={`permission-check__outer-and-${id}`}
				label="Outer And"
				description="Whether the next permission check should be ANDed (all needed) or OR'd (at least one) to the current"
				bind:value={permissionCheck.outer_and}
				disabled={false}
				onChange={() => {}}
			/>
			<BoolInput
				id={`permission-check__inner-and-${id}`}
				label="Inner And"
				description="Whether or not the permissions within THIS permission check are ANDed (all needed) or OR'd (at least one)"
				bind:value={permissionCheck.inner_and}
				disabled={false}
				onChange={() => {}}
			/>
		</details>
	</div>
</section>
