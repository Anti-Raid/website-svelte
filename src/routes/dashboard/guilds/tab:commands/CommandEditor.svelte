<script lang="ts">
	import { CanonicalModule, GuildCommandConfiguration } from '$lib/generated/silverpelt';
	import PermissionChecks from '../../../../components/dashboard/PermissionChecks.svelte';
	import { PermissionChecks as PCT } from '$lib/generated/silverpelt';
	import BoolInput from '../../../../components/inputs/BoolInput.svelte';
	import ListItem from '../../../../components/ListItem.svelte';
	import UnorderedList from '../../../../components/UnorderedList.svelte';
	import { PartialPatchRecord, createPartialPatch } from '$lib/partialPatch';
	import ButtonReact from '../../../../components/inputs/button/ButtonReact.svelte';
	import { Color } from '../../../../components/inputs/button/colors';
	import { fetchClient } from '$lib/fetch/fetch';
	import { get } from '$lib/configs/functions/services';
	import { getAuthCreds } from '$lib/auth/getAuthCreds';
	import { success } from '$lib/toast';
	import logger from '$lib/ui/logger';
	import { makeSharedRequest, opGetAllCommandConfigurations } from '$lib/fetch/ext';
	import { Clearable } from '$lib/generated/types';
	import BoxButton from '../../../../components/inputs/button/BoxButton.svelte';
	import { ParsedCanonicalCommandData } from '$lib/ui/commands';

	export let guildId: string;
	export let commands: ParsedCanonicalCommandData[];
	export let module: CanonicalModule;
	export let currentCommandConfiguration: GuildCommandConfiguration; // Guild command configuration being editted

	const isCommandDefaultEnabled = (): boolean => {
		logger.info('CommandEditor', 'isCommandDefaultEnabled', currentCommandConfiguration);

		let command = commands.find((c) => c.full_name === currentCommandConfiguration.command);

		if (!command) {
			throw new Error('Command not found in command list');
		}

		return command?.extended_data?.is_default_enabled;
	};

	const isCommandEnabled = (): boolean => {
		logger.info('CommandEditor', 'isCommandEnabled', currentCommandConfiguration);

		if (currentCommandConfiguration.disabled === undefined) {
			let command = commands.find((c) => c.full_name === currentCommandConfiguration.command);

			if (!command) {
				throw new Error('Command not found in command list');
			}

			return command?.extended_data?.is_default_enabled;
		}

		return !currentCommandConfiguration.disabled;
	};

	const isCommandDisabledOverriden = (
		currentCommandConfiguration: GuildCommandConfiguration
	): boolean => {
		return currentCommandConfiguration.disabled !== undefined;
	};

	const isCommandPermsOverriden = (
		currentCommandConfiguration: GuildCommandConfiguration
	): boolean => {
		return currentCommandConfiguration.perms !== undefined || !!currentCommandConfiguration.perms;
	};

	const getModuleDefaultPerms = (): PCT => {
		logger.info('CommandEditor', 'isCommandEnabled', currentCommandConfiguration);

		if (currentCommandConfiguration.perms === undefined) {
			let command = commands.find((c) => c.full_name === currentCommandConfiguration.command);

			if (!command) {
				throw new Error('Command not found in command list');
			}

			return command?.extended_data?.default_perms;
		}

		return currentCommandConfiguration.perms;
	};

	interface PartialPatchType {
		enabled: boolean;
		perms: PCT;
		__resetFields: ('enabled' | 'perms')[];
	}

	const getState = (): PartialPatchRecord<PartialPatchType> => {
		return {
			enabled: {
				initial: structuredClone(isCommandEnabled()),
				current: structuredClone(isCommandEnabled()),
				parse: (_state, snapshot, v) => {
					let value: Clearable<boolean> = {
						clear: false,
						value: !v
					};

					// Clear the value if the field is in the reset list
					if (snapshot?.__resetFields?.includes('enabled')) {
						value = {
							clear: true
						};
					}

					return {
						key: 'disabled',
						value
					};
				}
			},
			perms: {
				initial: structuredClone(getModuleDefaultPerms()),
				current: structuredClone(getModuleDefaultPerms()),
				parse: (_state, snapshot, v) => {
					let value: Clearable<PCT> = {
						clear: false,
						value: v
					};

					// Clear the value if the field is in the reset list
					if (snapshot?.__resetFields?.includes('perms')) {
						value = {
							clear: true
						};
					}

					return {
						key: 'perms',
						value
					};
				}
			},
			__resetFields: {
				initial: [],
				current: [],
				parse: (state, snapshot, v) => {
					return {
						key: '__resetFields',
						value: v
					};
				}
			}
		};
	};

	let state = getState();

	// Svelte workaround to workaround state
	//
	// If and only if the command name changes do we need to rederive the state
	let commandFullName: string;

	$: if (currentCommandConfiguration.command != commandFullName) {
		commandFullName = currentCommandConfiguration.command;
	}

	$: commandFullName, (state = getState());
	// end of workaround

	// Ensure changes is updated whenever state changes
	$: changes = createPartialPatch(state, { keepInternalKeys: true });

	// Ensure manuallyOverriden is updated whenever moduleId changes
	let toggleManuallyOverriden: boolean;
	let defaultPermsManuallyOverriden: boolean;
	$: commandFullName,
		(toggleManuallyOverriden = isCommandDisabledOverriden(currentCommandConfiguration));
	$: commandFullName,
		(defaultPermsManuallyOverriden = isCommandPermsOverriden(currentCommandConfiguration));

	const updateCommandConfiguration = async () => {
		let authCreds = getAuthCreds();

		if (!authCreds) throw new Error('No auth credentials found');

		const createPatch = createPartialPatch(state);

		if (Object.keys(changes).length == 0) {
			throw new Error('No changes to save');
		}

		logger.info(
			'ModuleInfoTab',
			'updateCommandConfiguration',
			guildId,
			currentCommandConfiguration.command,
			createPatch,
			state
		);

		let res = await fetchClient(
			`${get('splashtail')}/users/${authCreds?.user_id}/guilds/${guildId}/command-configurations`,
			{
				auth: authCreds?.token,
				method: 'PATCH',
				body: JSON.stringify({
					command: currentCommandConfiguration.command,
					...createPatch
				})
			}
		);

		if (!res.ok) {
			let err = await res.error('Failed to update command configuration');
			throw new Error(err);
		}

		let currentCommandConfigurations = await makeSharedRequest(
			opGetAllCommandConfigurations(guildId)
		);

		let currentCommandConfigurationReturned = currentCommandConfigurations.find(
			(c) => c.command === currentCommandConfiguration.command
		);

		if (!currentCommandConfigurationReturned) {
			throw new Error('Command not found in command configurations');
		}

		currentCommandConfiguration = currentCommandConfigurationReturned;

		state = getState(); // Rederive state
		success('Command configuration updated successfully');
	};
</script>

<BoolInput
	id="enabled"
	label="Command Enabled"
	description="Is this command enabled or not?"
	disabled={!module.commands_toggleable}
	bind:value={state.enabled.current}
	onChange={(_) => {}}
/>

{#if toggleManuallyOverriden}
	<BoxButton
		onclick={() => {
			if (state.__resetFields.current.includes('enabled')) {
				state.__resetFields.current = state.__resetFields.current.filter((f) => f !== 'enabled');
			} else {
				state.__resetFields.current.push('enabled');
				state = state; // Force re-render
			}
		}}
	>
		{state.__resetFields.current.includes('enabled') ? "Don't Reset" : 'Reset'}
	</BoxButton>
{/if}

<PermissionChecks
	id={`pc-${currentCommandConfiguration.command}`}
	bind:permissionChecks={state.perms.current}
/>

{#if defaultPermsManuallyOverriden}
	<BoxButton
		onclick={() => {
			if (state.__resetFields.current.includes('perms')) {
				state.__resetFields.current = state.__resetFields.current.filter((f) => f !== 'perms');
			} else {
				state.__resetFields.current.push('perms');
			}

			state = state; // Force re-render
		}}
	>
		{state.__resetFields.current.includes('perms') ? "Don't Reset" : 'Reset'}
	</BoxButton>
{/if}

{#if Object.keys(changes).length}
	<ButtonReact
		color={Color.Themable}
		icon="mdi:edit"
		text="Save"
		onClick={updateCommandConfiguration}
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
	description="Whether this command is enabled by default"
	disabled={true}
	value={isCommandDefaultEnabled()}
	onChange={() => {}}
/>

<UnorderedList>
	<ListItem>
		{#if module.commands_toggleable}
			<small class="text-green-500 mt-2">
				<strong>You can turn ON/OFF (toggle) the commands within this module!</strong>
			</small>
		{:else}
			<small class="text-red-500 mt-2">
				<strong
					>You CANNOT turn ON/OFF (toggle) the commands within this module at this time!</strong
				>
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
		{#if toggleManuallyOverriden}
			<small class="text-green-500 mt-2">
				<strong
					>The disabled/enabled state of this command has been manually modified and will no longer
					follow the default enabled/disabled state defined for it.</strong
				>
			</small>
		{:else}
			<small class="text-green-500 mt-2">
				<strong
					>This command will use the default enabled/disabled state defined for it unless manually
					modified.</strong
				>
			</small>
		{/if}
	</ListItem>

	<ListItem>
		{#if defaultPermsManuallyOverriden}
			<small class="text-green-500 mt-2">
				<strong>The default permissions of this command have been manually modified.</strong>
			</small>
		{:else}
			<small class="text-green-500 mt-2">
				<strong
					>This command will use the default permissions defined for it unless manually modified.</strong
				>
			</small>
		{/if}
	</ListItem>
</UnorderedList>
