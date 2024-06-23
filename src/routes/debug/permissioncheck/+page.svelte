<script lang="ts">
	import PermissionCheck from '../../../components/dashboard/PermissionCheck.svelte';
	import { PermissionCheck as PermissionCheckType } from '$lib/generated/silverpelt';

	let permissionCheck: PermissionCheckType = {
		kittycat_perms: [],
		native_perms: [],
		outer_and: false,
		inner_and: false
	};
</script>

<div class="px-4">
	<PermissionCheck id="debug" bind:permissionCheck />

	<small class="text-white font-semibold">permissionCheck: {JSON.stringify(permissionCheck)}</small>
</div>
