<script lang="ts">
	import { PermissionChecks } from '$lib/generated/silverpelt';
	import { CommonPermissionContext } from './commonPermissionContext';
	import InputNumber from '../../inputs/InputNumber.svelte';
	import PermissionCheckArray from './PermissionCheckArray.svelte';

	export let ctx: CommonPermissionContext;
	export let permissionChecks: PermissionChecks;
	export let id: string;
</script>

<section class="permission-check">
	<div class="permission-check__content">
		<details class="permission-check__details border p-2">
			<summary class="permission-check__summary hover:cursor-pointer">Permission Checks</summary>
			<PermissionCheckArray
				{ctx}
				bind:perms={permissionChecks.checks}
				id={`permission-checks__a-${id}`}
			/>
		</details>
		<details class="permission-check__details border p-2">
			<summary class="permission-check__summary hover:cursor-pointer">Constraints</summary>
			<InputNumber
				id={`permission-checks-needed-${id}`}
				label="Checks Needed"
				description="The number of checks that must pass"
				disabled={false}
				placeholder="Checks Needed"
				bind:value={permissionChecks.checks_needed}
				minlength={0}
			/>
		</details>
	</div>
</section>
