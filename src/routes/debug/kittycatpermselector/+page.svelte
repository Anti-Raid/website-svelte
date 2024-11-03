<script lang="ts">
	import KittycatPermSelector from '@components/dashboard/permissions/KittycatPermSelector.svelte';
	import { dbgCreateContext } from '../debug';

	let validPerm: boolean = false;
</script>

{#await dbgCreateContext() then commonPermissionContext}
	<div class="px-4">
		<KittycatPermSelector
			perm="server_backups.create"
			bind:validPerm
			ctx={commonPermissionContext}
		/>

		<small class="text-white font-semibold">validPerm: {validPerm}</small>
	</div>
{/await}
