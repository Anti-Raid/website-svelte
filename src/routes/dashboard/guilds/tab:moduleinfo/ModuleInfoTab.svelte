<script lang="ts">
	import { CanonicalModule, GuildModuleConfiguration } from '$lib/generated/silverpelt';
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
	import logger from '$lib/ui/logger';
	import { makeSharedRequest, opGetModuleConfiguration } from '$lib/fetch/ext';
	import { Clearable } from '$lib/generated/types';
	import BoxButton from '../../../../components/inputs/button/BoxButton.svelte';
	import { NoticeProps } from '../../../../components/common/noticearea/noticearea';
	import NoticeArea from '../../../../components/common/noticearea/NoticeArea.svelte';

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

	const isModuleDefaultPermsOverriden = (
		currentModuleConfiguration: GuildModuleConfiguration[]
	): boolean => {
		let cmc = currentModuleConfiguration.find((m) => m.module === module.id);

		if (!cmc) {
			return false;
		}

		return !!cmc.default_perms;
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
		__resetFields: ('enabled' | 'default_perms')[];
	}

	const getState = (): PartialPatchRecord<PartialPatchType> => {
		return {
			enabled: {
				initial: structuredClone(isModuleEnabled()),
				current: structuredClone(isModuleEnabled()),
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
			default_perms: {
				initial: structuredClone(getModuleDefaultPerms()),
				current: structuredClone(getModuleDefaultPerms()),
				parse: (_state, snapshot, v) => {
					let value: Clearable<PCT> = {
						clear: false,
						value: v
					};

					// Clear the value if the field is in the reset list
					if (snapshot?.__resetFields?.includes('default_perms')) {
						value = {
							clear: true
						};
					}

					return {
						key: 'default_perms',
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
	// If and only if the module id changes do we need to rederive the state
	let moduleId: string;

	$: if (module.id != moduleId) {
		moduleId = module.id;
	}

	$: moduleId, (state = getState());
	// end of workaround

	// Ensure changes is updated whenever state changes
	$: changes = createPartialPatch(state, { keepInternalKeys: true });

	// Ensure manuallyOverriden is updated whenever moduleId changes
	let toggleManuallyOverriden: boolean;
	let defaultPermsManuallyOverriden: boolean;
	$: moduleId, (toggleManuallyOverriden = isModuleDisabledOverriden(currentModuleConfiguration));
	$: moduleId,
		(defaultPermsManuallyOverriden = isModuleDefaultPermsOverriden(currentModuleConfiguration));

	const updateModuleConfiguration = async () => {
		let authCreds = getAuthCreds();

		if (!authCreds) throw new Error('No auth credentials found');

		const createPatch = createPartialPatch(state);

		if (Object.keys(changes).length == 0) {
			throw new Error('No changes to save');
		}

		logger.info(
			'ModuleInfoTab',
			'updateModuleConfiguration',
			guildId,
			module.id,
			createPatch,
			state
		);

		let res = await fetchClient(
			`${get('splashtail')}/users/${authCreds?.user_id}/guilds/${guildId}/module-configurations`,
			{
				auth: authCreds?.token,
				method: 'PATCH',
				body: JSON.stringify({
					module: module.id,
					...createPatch
				})
			}
		);

		if (!res.ok) {
			let err = await res.error('Failed to update module configuration');
			throw new Error(err);
		}

		currentModuleConfiguration = await makeSharedRequest(opGetModuleConfiguration(guildId));

		state = getState(); // Rederive state
	};

	let updateNoticeArea: NoticeProps | null;
</script>

<BoolInput
	id="enabled"
	label="Module Enabled"
	description="Is this module enabled or not?"
	disabled={!module.toggleable}
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

<PermissionChecks id={`pc-${module.id}`} bind:permissionChecks={state.default_perms.current} />

{#if defaultPermsManuallyOverriden}
	<BoxButton
		onclick={() => {
			if (state.__resetFields.current.includes('default_perms')) {
				state.__resetFields.current = state.__resetFields.current.filter(
					(f) => f !== 'default_perms'
				);
			} else {
				state.__resetFields.current.push('default_perms');
			}

			state = state; // Force re-render
		}}
	>
		{state.__resetFields.current.includes('default_perms') ? "Don't Reset" : 'Reset'}
	</BoxButton>
{/if}

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
		bind:noticeProps={updateNoticeArea}
	/>
{/if}

{#if updateNoticeArea}
	<NoticeArea props={updateNoticeArea} />
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

	<ListItem>
		{#if defaultPermsManuallyOverriden}
			<small class="text-green-500 mt-2">
				<strong>The default permissions of this module have been manually modified.</strong>
			</small>
		{:else}
			<small class="text-green-500 mt-2">
				<strong
					>This module will use the default permissions defined for it unless manually modified.</strong
				>
			</small>
		{/if}
	</ListItem>
</UnorderedList>
