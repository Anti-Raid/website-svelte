<script lang="ts">
	import PermissionCheck from '../../../components/dashboard/permissions/PermissionCheck.svelte';
	import { PermissionCheck as PermissionCheckType } from '$lib/generated/silverpelt';
	import { dbgCreateContext } from '../debug';

	let permissionCheck: PermissionCheckType = {
		kittycat_perms: [],
		native_perms: [],
		outer_and: false,
		inner_and: false
	};
</script>

{#await dbgCreateContext() then commonPermissionContext}
	<div class="px-4">
		<PermissionCheck id="debug" bind:permissionCheck ctx={commonPermissionContext} />

		<small class="text-white font-semibold"
			>permissionCheck: {JSON.stringify(permissionCheck)}</small
		>
	</div>
{/await}
