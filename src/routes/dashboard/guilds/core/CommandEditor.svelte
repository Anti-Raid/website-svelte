<script lang="ts">
	import {
		CanonicalModule,
		FullGuildCommandConfiguration,
		GuildCommandConfiguration
	} from '$lib/generated/silverpelt';
	import PermissionChecks from '@components/dashboard/permissions/PermissionChecks.svelte';
	import { PermissionChecks as PCT } from '$lib/generated/silverpelt';
	import BoolInput from '@components/inputs/BoolInput.svelte';
	import ListItem from '@components/ListItem.svelte';
	import UnorderedList from '@components/UnorderedList.svelte';
	import { PartialPatchRecord, createPartialPatch } from '$lib/partialPatch';
	import ButtonReact from '@components/inputs/button/ButtonReact.svelte';
	import { Color } from '@components/inputs/button/colors';
	import { fetchClient } from '$lib/fetch/fetch';
	import { get } from '$lib/configs/functions/services';
	import { getAuthCreds } from '$lib/auth/getAuthCreds';
	import logger from '$lib/ui/logger';
	import { Clearable } from '$lib/generated/types';
	import BoxButton from '@components/inputs/button/BoxButton.svelte';
	import {
		getCommandExtendedData,
		isPermissionCheckEmpty,
		ParsedCanonicalCommandData
	} from '$lib/ui/commands';
	import { NoticeProps } from '@components/common/noticearea/noticearea';
	import NoticeArea from '@components/common/noticearea/NoticeArea.svelte';
	import { CommonPermissionContext } from '@components/dashboard/permissions/commonPermissionContext';
	import Label from '@components/inputs/Label.svelte';
	import ObjectRender from '@components/ObjectRender.svelte';
	import Developer from '@components/common/Developer.svelte';

	export let guildId: string;
	export let commands: ParsedCanonicalCommandData[];
	export let module: CanonicalModule;
	export let commonPermissionContext: CommonPermissionContext;
	export let allCurrentCommandConfigurations: FullGuildCommandConfiguration[]; // All command configurations
	export let currentCommandConfiguration: GuildCommandConfiguration; // Guild command configuration being editted

	$: logger.info(
		'CommandEditor',
		'commands',
		allCurrentCommandConfigurations,
		currentCommandConfiguration
	);

	const isCommandVirtual = (): boolean => {
		let extendedData = getCommandExtendedData(commands, currentCommandConfiguration.command);
		return extendedData.virtual_command;
	};

	const isCommandDefaultEnabled = (): boolean => {
		logger.info('CommandEditor', 'isCommandDefaultEnabled', currentCommandConfiguration);

		let extendedData = getCommandExtendedData(commands, currentCommandConfiguration.command);

		logger.info('CommandEditor', 'isCommandDefaultEnabled.extendedData', extendedData);

		return extendedData?.is_default_enabled;
	};

	const isCommandEnabled = (): boolean => {
		logger.info('CommandEditor', 'isCommandEnabled', currentCommandConfiguration);

		if (currentCommandConfiguration.disabled === undefined) {
			return isCommandDefaultEnabled();
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
		let cc = allCurrentCommandConfigurations.find(
			(c) => c.command === currentCommandConfiguration.command
		);

		if (!cc) {
			return false;
		}

		logger.info('CommandEditor', 'isCommandPermsOverriden', cc);
		return !!cc?.perms;
	};

	const getCurrentFullCommandConfiguration = (
		currentCommandConfiguration: GuildCommandConfiguration
	): FullGuildCommandConfiguration | null => {
		let cc = allCurrentCommandConfigurations.find(
			(c) => c.command === currentCommandConfiguration.command
		);

		if (!cc) {
			return null;
		}

		logger.info('CommandEditor', 'isCommandPermsOverriden', cc);
		return cc;
	};

	const getCommandDefaultPerms = (): PCT => {
		let commandExtendedData = getCommandExtendedData(commands, currentCommandConfiguration.command);
		return (
			allCurrentCommandConfigurations.find(
				(c) => c.command === currentCommandConfiguration?.command
			)?.perms || commandExtendedData.default_perms
		);
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
				initial: structuredClone(getCommandDefaultPerms()),
				current: structuredClone(getCommandDefaultPerms()),
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

					// Check and restore backup
					if (
						value.value &&
						isPermissionCheckEmpty(value.value) &&
						permCheck_backupTab !== '' &&
						permCheck_backupPermissionChecks
					) {
						value.value = structuredClone(permCheck_backupPermissionChecks);
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
					return null;
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
	$: changes = createPartialPatch(state);

	// Ensure manuallyOverriden is updated whenever moduleId changes
	let toggleManuallyOverriden: boolean;
	let defaultPermsManuallyOverriden: boolean;
	let currentFullCommandConfiguration: FullGuildCommandConfiguration | null;
	$: commandFullName,
		(toggleManuallyOverriden = isCommandDisabledOverriden(currentCommandConfiguration));
	$: commandFullName,
		(defaultPermsManuallyOverriden = isCommandPermsOverriden(currentCommandConfiguration));
	$: commandFullName,
		(currentFullCommandConfiguration = getCurrentFullCommandConfiguration(
			currentCommandConfiguration
		));

	// Backup fields
	let permCheck_backupPermissionChecks: PCT | undefined = undefined;
	let permCheck_backupTab: string = '';
	$: commandFullName,
		(permCheck_backupPermissionChecks = structuredClone(getCommandDefaultPerms()));
	$: commandFullName, (permCheck_backupTab = '');

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

		let res = await fetchClient(`${get('splashtail')}/guilds/${guildId}/command-configurations`, {
			auth: authCreds?.token,
			method: 'PATCH',
			body: JSON.stringify({
				command: currentCommandConfiguration.command,
				...createPatch
			})
		});

		if (!res.ok) {
			let err = await res.error('Failed to update command configuration');
			throw new Error(err);
		}

		let fcc: FullGuildCommandConfiguration = await res.json();

		currentCommandConfiguration = {
			id: fcc.id,
			guild_id: fcc.guild_id,
			command: fcc.command,
			disabled: fcc.disabled,
			perms: fcc.perms
		};

		// Find index in allCurrentCommandConfigurations
		let index = allCurrentCommandConfigurations.findIndex(
			(c) => c.command === currentCommandConfiguration.command
		);

		if (index === -1) {
			// New command configuration
			allCurrentCommandConfigurations.push(fcc);
		} else {
			// Update existing command configuration
			allCurrentCommandConfigurations[index] = fcc;
		}

		state = getState(); // Rederive state
		permCheck_backupTab = '';
		permCheck_backupPermissionChecks = undefined;
	};

	let updateNoticeArea: NoticeProps | null;
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
		onClick={() => {
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

<Label id="perms" label="Command Permissions" />

<PermissionChecks
	id={`pc-${currentCommandConfiguration.command}`}
	bind:permissionChecks={state.perms.current}
	bind:backupPermissionChecks={permCheck_backupPermissionChecks}
	bind:backupTab={permCheck_backupTab}
	ctx={commonPermissionContext}
/>

{#if defaultPermsManuallyOverriden}
	<BoxButton
		onClick={() => {
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
		icon="mdi:edit"
		text="Save"
		onClick={updateCommandConfiguration}
		states={{
			loading: 'Saving...',
			success: 'Saved!',
			error: 'Failed to save changes'
		}}
		bind:noticeProps={updateNoticeArea}
	/>
{/if}

{#if updateNoticeArea}
	<NoticeArea props={updateNoticeArea} />
{/if}

<Developer>
	<BoolInput
		id="enabled-by-default"
		label="Enabled by default"
		description="Whether this command is enabled by default"
		disabled={true}
		value={isCommandDefaultEnabled()}
		onChange={() => {}}
	/>

	{#if currentFullCommandConfiguration}
		<ObjectRender
			object={{
				'Created At': currentFullCommandConfiguration.created_at,
				'Last Updated At': currentFullCommandConfiguration.last_updated_at,
				'Created By': currentFullCommandConfiguration.created_by,
				'Last Updated By': currentFullCommandConfiguration.last_updated_by
			}}
		/>
	{/if}

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
						>The disabled/enabled state of this command has been manually modified and will no
						longer follow the default enabled/disabled state defined for it.</strong
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

		<ListItem>
			{#if isCommandVirtual()}
				<small class="text-green-500 mt-2">
					<strong
						>This command is a virtual command meant for access control/security purposes and is not
						physically usable within the bot</strong
					>
				</small>
			{:else}
				<small class="text-green-500 mt-2">
					<strong
						>This command is NOT a virtual command and should be usable within the bot via slash
						commands.</strong
					>
				</small>
			{/if}
		</ListItem>
	</UnorderedList>
</Developer>
