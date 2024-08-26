<script lang="ts">
	import { PermissionChecks } from '$lib/generated/silverpelt';
	import { onMount } from 'svelte';
	import TabbedPane from '../../inputs/button/tabs/TabbedPane.svelte';
	import { CommonPermissionContext } from './commonPermissionContext';
	import PermissionCheckArray from './PermissionCheckArray.svelte';
	import TabButton from '../../inputs/button/tabs/TabButton.svelte';
	import InputTextArea from '../../inputs/InputTextArea.svelte';

	export let ctx: CommonPermissionContext;
	export let id: string;

	export let openTab: string = '';

	$: if (permissionChecks?.Simple) {
		openTab = 'simple';
	} else {
		openTab = 'template';
	}

	export let permissionChecks: PermissionChecks;
	// We always store a backup of the original permission checks on change
	// This is so we can revert back to the original state if the user cancels
	export let backupPermissionChecks: PermissionChecks | undefined = undefined;
	export let backupTab: string = '';
</script>

<TabbedPane
	tabs={[
		{
			id: 'simple',
			label: 'Simple',
			onClick: async () => {
				if (openTab == 'simple') return;
				if (backupPermissionChecks?.Simple) {
					// Restore the backup
					permissionChecks = structuredClone(backupPermissionChecks);
				} else {
					// Create a backup and clear the simple checks
					backupPermissionChecks = structuredClone(permissionChecks);
					backupTab = openTab;
					permissionChecks = { Simple: { checks: [] } };
				}
				openTab = 'simple';
			}
		},
		{
			id: 'template',
			label: 'Advanced',
			onClick: async () => {
				if (openTab == 'template') return;
				if (backupPermissionChecks?.Template) {
					// Restore the backup
					permissionChecks = structuredClone(backupPermissionChecks);
				} else {
					// Create a backup and clear the simple checks
					backupPermissionChecks = structuredClone(permissionChecks);
					backupTab = openTab;
					permissionChecks = { Template: { template: '' } };
				}
				openTab = 'template';
			}
		}
	]}
	visibleTab={openTab}
/>

{#if openTab == 'simple'}
	{#if permissionChecks?.Simple}
		<PermissionCheckArray
			{ctx}
			bind:perms={permissionChecks.Simple.checks}
			id={`permission-checks__a-${id}`}
		/>
	{/if}
{:else if openTab == 'template'}
	{#if permissionChecks?.Template}
		<InputTextArea
			id={`permission-checks__t-${id}`}
			label={'Template'}
			placeholder={'Enter a template'}
			minlength={0}
			bind:value={permissionChecks.Template.template}
		/>
	{/if}
{/if}

<p>
	{JSON.stringify(permissionChecks)}
</p>
