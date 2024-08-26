<script lang="ts">
	import { CanonicalModule, GuildModuleConfiguration } from '$lib/generated/silverpelt';
	import PermissionChecks from '../../../../components/dashboard/permissions/PermissionChecks.svelte';
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
	import { Clearable } from '$lib/generated/types';
	import BoxButton from '../../../../components/inputs/button/BoxButton.svelte';
	import { NoticeProps } from '../../../../components/common/noticearea/noticearea';
	import NoticeArea from '../../../../components/common/noticearea/NoticeArea.svelte';
	import { CommonPermissionContext } from '../../../../components/dashboard/permissions/commonPermissionContext';
	import Label from '../../../../components/inputs/Label.svelte';
	import { isPermissionCheckEmpty } from '$lib/ui/commands';

	export let guildId: string;
	export let module: CanonicalModule;
	export let currentModuleConfiguration: GuildModuleConfiguration[];
	export let commonPermissionContext: CommonPermissionContext;

	let state: PartialPatchRecord<PartialPatchType>;
	let moduleId: string;
	let changes: any = {};
	let toggleManuallyOverriden: boolean;
	let defaultPermsManuallyOverriden: boolean;
	let permCheck_backupPermissionChecks: PCT | undefined = undefined;
	let permCheck_backupTab: string = '';
	let updateNoticeArea: NoticeProps | null;

	// Define reactive variables
	$: moduleId = module.id;
	$: state = getState();
	$: toggleManuallyOverriden = isModuleDisabledOverriden(currentModuleConfiguration);
	$: defaultPermsManuallyOverriden = isModuleDefaultPermsOverriden(currentModuleConfiguration);
	$: permCheck_backupPermissionChecks = structuredClone(getModuleDefaultPerms());
	$: permCheck_backupTab = '';
	$: changes = createPartialPatch(state);

	const isModuleEnabled = (): boolean => {
		let cmc = currentModuleConfiguration.find((m) => m.module === module.id);
		return cmc ? !cmc.disabled : module?.is_default_enabled;
	};

	const isModuleDisabledOverriden = (
		currentModuleConfiguration: GuildModuleConfiguration[]
	): boolean => {
		let cmc = currentModuleConfiguration.find((m) => m.module === module.id);
		return cmc ? cmc.disabled !== undefined : false;
	};

	const isModuleDefaultPermsOverriden = (
		currentModuleConfiguration: GuildModuleConfiguration[]
	): boolean => {
		let cmc = currentModuleConfiguration.find((m) => m.module === module.id);
		return cmc ? !!cmc.default_perms : false;
	};

	const getModuleDefaultPerms = (): PCT => {
		return (
			currentModuleConfiguration.find((m) => m.module === module.id)?.default_perms || {
				Simple: {
					checks: []
				}
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

					if (snapshot?.__resetFields?.includes('default_perms')) {
						value = {
							clear: true
						};
					}

					if (
						value.value &&
						isPermissionCheckEmpty(value.value) &&
						permCheck_backupTab !== '' &&
						permCheck_backupPermissionChecks
					) {
						value.value = structuredClone(permCheck_backupPermissionChecks);
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
					return null;
				}
			}
		};
	};

	const updateModuleConfiguration = async () => {
		let authCreds = getAuthCreds();

		if (!authCreds) throw new Error('No auth credentials found');

		if (Object.keys(changes).length == 0) {
			throw new Error('No changes to save');
		}

		let res = await fetchClient(`${get('splashtail')}/guilds/${guildId}/module-configurations`, {
			auth: authCreds?.token,
			method: 'PATCH',
			body: JSON.stringify({
				module: module.id,
				...changes
			})
		});

		if (!res.ok) {
			let err = await res.error('Failed to update module configuration');
			throw new Error(err);
		}

		let newConfig: GuildModuleConfiguration = await res.json();

		let moduleConfigIndex = currentModuleConfiguration.findIndex((m) => m.module === module.id);

		if (moduleConfigIndex === -1) {
			currentModuleConfiguration.push(newConfig);
		} else {
			currentModuleConfiguration[moduleConfigIndex] = newConfig;
		}

		state = getState(); // Rederive state
		permCheck_backupTab = '';
		permCheck_backupPermissionChecks = undefined;
	};
</script>

<Label id="enable_disable_module" label="Enable/Disable Module" />

<!--TODO: Use onChange better-->
<BoolInput
	id="enabled"
	label="Module Enabled"
	description="Is this module enabled or not?"
	disabled={!module.toggleable}
	bind:value={state.enabled.current}
	onChange={() => {}}
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

<Label id="default_perms" label="Default Module Permissions" />

<PermissionChecks
	id={`pc-${module.id}`}
	bind:permissionChecks={state.default_perms.current}
	bind:backupPermissionChecks={permCheck_backupPermissionChecks}
	bind:backupTab={permCheck_backupTab}
	ctx={commonPermissionContext}
/>

{#if defaultPermsManuallyOverriden}
	<BoxButton
		onclick={() => {
			if (state.__resetFields.current.includes('default_perms')) {
				state.__resetFields.current = state.__resetFields.current.filter(
					(f) => f !== 'default_perms'
				);
			} else {
				state.__resetFields.current.push('default_perms');
				state = state; // Force re-render
			}
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

<!--TODO: Use onchange better-->
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
				<strong>
					The disabled/enabled state of this module has been manually modified and will no longer
					follow the default enabled/disabled state defined for it.
				</strong>
			</small>
		{:else}
			<small class="text-green-500 mt-2">
				<strong>
					This module will use the default enabled/disabled state defined for it unless manually
					modified.
				</strong>
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
				<strong>
					This module will use the default permissions defined for it unless manually modified.
				</strong>
			</small>
		{/if}
	</ListItem>
</UnorderedList>
