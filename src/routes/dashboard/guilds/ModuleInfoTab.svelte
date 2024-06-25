<script lang="ts">
	import { CanonicalModule, GuildModuleConfiguration } from '$lib/generated/silverpelt';
	import PermissionChecks from '../../../components/dashboard/PermissionChecks.svelte';
	import { PermissionChecks as PCT } from '$lib/generated/silverpelt';
	import BoolInput from '../../../components/inputs/BoolInput.svelte';
	import ListItem from '../../../components/ListItem.svelte';
	import UnorderedList from '../../../components/UnorderedList.svelte';
	import { PartialPatchRecord, createPartialPatch } from '$lib/utils';
	import ButtonReact from '../../../components/inputs/button/ButtonReact.svelte';
	import { Color } from '../../../components/inputs/button/colors';
	import { fetchClient } from '$lib/fetch/fetch';
	import { get } from '$lib/configs/functions/services';
	import { getAuthCreds } from '$lib/auth/getAuthCreds';
	import { success } from '$lib/toast';

	export let guildId: string;
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

	let state = {
		disabled: {
			initial: structuredClone(isModuleDisabled()),
			current: structuredClone(isModuleDisabled())
		},
		default_perms: {
			initial: structuredClone(getModuleDefaultPerms()),
			current: structuredClone(getModuleDefaultPerms())
		}
	};

	const updateModuleConfiguration = async () => {
		let authCreds = getAuthCreds();

		if (!authCreds) throw new Error('No auth credentials found');

		const createPatch = createPartialPatch(state as PartialPatchRecord<unknown>);

		let res = await fetchClient(
			`${get('splashtail')}/users/${authCreds?.user_id}/guilds/${guildId}/modules/${
				module.id
			}/configurations`,
			{
				auth: authCreds?.token,
				method: 'PATCH',
				body: JSON.stringify(createPatch)
			}
		);

		if (!res.ok) {
			let err = await res.error('Failed to update module configuration');
			throw new Error(err);
		}

		success('Module configuration updated successfully');
	};

	$: module.id,
		(state = {
			disabled: {
				initial: structuredClone(isModuleDisabled()),
				current: isModuleDisabled()
			},
			default_perms: {
				initial: structuredClone(getModuleDefaultPerms()),
				current: getModuleDefaultPerms()
			}
		});
</script>

<BoolInput
	id="disabled"
	label="Module Disabled"
	description="Is this module disabled or not?"
	disabled={!module.toggleable}
	bind:value={state.disabled.current}
	onChange={(_) => {}}
/>
<PermissionChecks id={`pc-${module.id}`} bind:permissionChecks={state.default_perms.current} />

<ButtonReact
	color={Color.Themable}
	icon="mdi:save"
	text="Save"
	onClick={updateModuleConfiguration}
	states={{
		loading: 'Saving...',
		success: 'Saved!',
		error: 'Failed to save changes'
	}}
/>

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
