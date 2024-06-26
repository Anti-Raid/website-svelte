<script lang="ts">
	import { CanonicalModule, GuildModuleConfiguration } from '$lib/generated/silverpelt';
	import PermissionChecks from '../../../components/dashboard/PermissionChecks.svelte';
	import { PermissionChecks as PCT } from '$lib/generated/silverpelt';
	import BoolInput from '../../../components/inputs/BoolInput.svelte';
	import ListItem from '../../../components/ListItem.svelte';
	import UnorderedList from '../../../components/UnorderedList.svelte';
	import { PartialPatchRecord, createPartialPatch } from '$lib/partialPatch';
	import ButtonReact from '../../../components/inputs/button/ButtonReact.svelte';
	import { Color } from '../../../components/inputs/button/colors';
	import { fetchClient } from '$lib/fetch/fetch';
	import { get } from '$lib/configs/functions/services';
	import { getAuthCreds } from '$lib/auth/getAuthCreds';
	import { success } from '$lib/toast';
	import logger from '$lib/ui/logger';
	import { makeSharedRequest, opGetModuleConfiguration } from '$lib/fetch/ext';

	export let guildId: string;
	export let module: CanonicalModule;
	export let currentModuleConfiguration: GuildModuleConfiguration[];

	const isModuleEnabled = (): boolean => {
		logger.info('ModuleInfoTab', 'isModuleEnabled', module.id, currentModuleConfiguration);

		let cmc = currentModuleConfiguration.find((m) => m.module === module.id);

		if (!cmc) {
			logger.info(
				'ModuleInfoTab',
				'isModuleEnabled',
				module.id,
				'not found in currentModuleConfiguration'
			);
			return module?.is_default_enabled;
		}

		return cmc.disabled === undefined ? module?.is_default_enabled : !cmc.disabled;
	};

	const isModuleDisabledOverriden = (
		currentModuleConfiguration: GuildModuleConfiguration[]
	): boolean => {
		let cmc = currentModuleConfiguration.find((m) => m.module === module.id);

		if (!cmc) {
			return false;
		}

		return cmc.disabled !== undefined;
	};

	const getModuleDefaultPerms = (): PCT => {
		return (
			currentModuleConfiguration.find((m) => m.module === module.id)?.default_perms || {
				checks: [],
				checks_needed: 1
			}
		);
	};

	interface PartialPatchType {
		enabled: boolean;
		default_perms: PCT;
	}

	const getState = (): PartialPatchRecord<PartialPatchType> => {
		return {
			enabled: {
				initial: structuredClone(isModuleEnabled()),
				current: structuredClone(isModuleEnabled()),
				parse: (v) => {
					return {
						key: 'disabled',
						value: !v
					};
				}
			},
			default_perms: {
				initial: structuredClone(getModuleDefaultPerms()),
				current: structuredClone(getModuleDefaultPerms())
			}
		};
	};

	let state = getState();

	// Svelte workaround to workaround state
	//
	// If and only if the module id changes do we need to rederive the state
	let moduleId: string;

	$: if (module.id != moduleId) {
		moduleId = module.id;
	}

	$: moduleId, (state = getState());
	// end of workaround

	// Ensure changes is updated whenever state changes
	$: changes = createPartialPatch(state);

	// Ensure manuallyOverriden is updated whenever moduleId changes
	let manuallyOverriden: boolean;
	$: moduleId, (manuallyOverriden = isModuleDisabledOverriden(currentModuleConfiguration));

	const updateModuleConfiguration = async () => {
		let authCreds = getAuthCreds();

		if (!authCreds) throw new Error('No auth credentials found');

		const createPatch = createPartialPatch(state);

		if (Object.keys(changes).length == 0) {
			throw new Error('No changes to save');
		}

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

		currentModuleConfiguration = await makeSharedRequest(opGetModuleConfiguration(guildId));

		state = getState(); // Rederive state
		success('Module configuration updated successfully');
	};
</script>

<BoolInput
	id="enabled"
	label="Module Enabled"
	description="Is this module enabled or not?"
	disabled={!module.toggleable}
	bind:value={state.enabled.current}
	onChange={(_) => {}}
/>
<PermissionChecks id={`pc-${module.id}`} bind:permissionChecks={state.default_perms.current} />

{#if Object.keys(changes).length}
	<ButtonReact
		color={Color.Themable}
		icon="mdi:edit"
		text="Save"
		onClick={updateModuleConfiguration}
		states={{
			loading: 'Saving...',
			success: 'Saved!',
			error: 'Failed to save changes'
		}}
	/>
{/if}

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
		{#if module.commands_toggleable}
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

	<ListItem>
		{#if manuallyOverriden}
			<small class="text-green-500 mt-2">
				<strong
					>The disabled/enabled state of this module has been manually modified and will no longer
					follow the default enabled/disabled state defined for it.</strong
				>
			</small>
		{:else}
			<small class="text-green-500 mt-2">
				<strong
					>This module will use the default enabled/disabled state defined for it unless manually
					modified.</strong
				>
			</small>
		{/if}
	</ListItem>
</UnorderedList>
