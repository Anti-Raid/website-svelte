<script lang="ts">
	import { CanonicalModule, GuildModuleConfiguration } from '$lib/generated/silverpelt';
	import PermissionChecks from '../../../components/dashboard/PermissionChecks.svelte';
	import { PermissionChecks as PCT } from '$lib/generated/silverpelt';
	import BoolInput from '../../../components/inputs/BoolInput.svelte';
	import ListItem from '../../../components/ListItem.svelte';
	import UnorderedList from '../../../components/UnorderedList.svelte';

	export let module: CanonicalModule;
	export let currentModuleConfiguration: GuildModuleConfiguration[];

	const isModuleDisabled = (): boolean => {
		return currentModuleConfiguration.find((m) => m.module === module.id)?.disabled === undefined
			? module?.is_default_enabled
			: !currentModuleConfiguration.find((m) => m.module === module.id)?.disabled;
	};

	const getModuleDefaultPerms = (): PCT => {
		return (
			currentModuleConfiguration.find((m) => m.module === module.id)?.default_perms || {
				checks: [],
				checks_needed: 1
			}
		);
	};

	const state = {
		moduleDisabled: {
			initial: structuredClone(isModuleDisabled()),
			current: isModuleDisabled()
		},
		moduleDefaultPerms: {
			initial: structuredClone(getModuleDefaultPerms()),
			current: getModuleDefaultPerms()
		}
	};
</script>

<BoolInput
	id="enabled"
	label="Module Enabled"
	description="Toggle this module on or off"
	disabled={!module.toggleable}
	bind:value={state.moduleDisabled.current}
	onChange={(_) => {}}
/>
<PermissionChecks id={`pc-${module.id}`} bind:permissionChecks={state.moduleDefaultPerms.current} />

<hr class="mt-5 border-[4px]" />

<BoolInput
	id="enabled-by-default"
	label="Enabled by default"
	description="Whether this module is enabled by default"
	disabled={true}
	value={module.is_default_enabled}
	onChange={() => {}}
/>

<UnorderedList>
	<ListItem>
		{#if module.commands_configurable}
			<small class="text-green-500 mt-2">
				<strong>Commands in this module are individually CONFIGURABLE</strong>
			</small>
		{:else}
			<small class="text-red-500 mt-2">
				<strong>Commands in this module are NOT individually CONFIGURABLE</strong>
			</small>
		{/if}
	</ListItem>

	<ListItem>
		{#if module.web_hidden}
			<small class="text-red-500 mt-2">
				<strong>This module is HIDDEN on the website and dashboard</strong>
			</small>
		{:else}
			<small class="text-green-500 mt-2">
				<strong>This module is VISIBLE on the website and dashboard</strong>
			</small>
		{/if}
	</ListItem>

	<ListItem>
		{#if module.toggleable}
			<small class="text-green-500 mt-2">
				<strong>This module can be enabled/disabled (TOGGLEABLE)</strong>
			</small>
		{:else}
			<small class="text-red-500 mt-2">
				<strong>This module cannot be enabled/disabled (IS NOT TOGGLEABLE)</strong>
			</small>
		{/if}
	</ListItem>
</UnorderedList>
