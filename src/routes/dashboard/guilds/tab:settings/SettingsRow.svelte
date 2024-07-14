<script lang="ts">
	import {
		CanonicalColumn,
		CanonicalConfigOption,
		CanonicalModule
	} from '$lib/generated/silverpelt';
	import {
		getDispatchType,
		deriveColumnState,
		templateToStringLite,
		ColumnState
	} from '$lib/ui/settings';
	import Icon from '@iconify/svelte';
	import { DerivedData, OperationTypes } from './types';
	import InputText from '../../../../components/inputs/InputText.svelte';
	import Message from '../../../../components/Message.svelte';
	import SettingsColumn from './SettingsColumn.svelte';
	import { fetchClient } from '$lib/fetch/fetch';
	import { get } from '$lib/configs/functions/services';
	import { getAuthCreds } from '$lib/auth/getAuthCreds';
	import { SettingsExecute, SettingsExecuteResponse } from '$lib/generated/types';
	import ButtonReact from '../../../../components/inputs/button/ButtonReact.svelte';
	import isEqual from 'lodash.isequal';
	import { Color } from '../../../../components/inputs/button/colors';
	import { NoticeProps } from '../../../../components/common/noticearea/noticearea';
	import NoticeArea from '../../../../components/common/noticearea/NoticeArea.svelte';
	import Spacer from '../../../../components/inputs/Spacer.svelte';

	export let configOpt: CanonicalConfigOption;
	export let module: CanonicalModule;
	export let guildId: string;
	export let columnField: Record<string, any>;
	export let index: number;
	export let settings: SettingsExecuteResponse;
	export let debugMode: boolean;

	// The current operation type this row is under
	let currentOperationType: OperationTypes = 'Update';

	let allDerivedData: { [key: string]: DerivedData } = {};
	const getDataAsync = async (
		columnField: Record<string, any>,
		column: CanonicalColumn,
		configOpt: CanonicalConfigOption,
		currentOperationType: OperationTypes
	): Promise<DerivedData> => {
		let result = {
			dispatchType: getDispatchType(columnField, column),
			columnState: deriveColumnState(configOpt, column, currentOperationType)
		};

		allDerivedData[column.id] = result;

		return result;
	};

	const editRow = async () => {
		const creds = getAuthCreds();
		if (!creds) throw new Error('No auth credentials found');

		let fields: Record<string, any> = {};

		Object.keys(columnField).forEach((k) => {
			let column = configOpt.columns.find((c) => c.id === k);

			if (!column) {
				return;
			}

			if (column.ignored_for.includes('Update')) {
				return;
			}

			fields[k] = columnField[k];
		});

		let payload: SettingsExecute = {
			operation: 'Update',
			module: module.id,
			setting: configOpt.id,
			fields
		};

		let res = await fetchClient(`${get('splashtail')}/guilds/${guildId}/settings`, {
			method: 'POST',
			auth: creds.token,
			body: JSON.stringify(payload)
		});

		if (!res.ok) {
			let err = await res.error('Failed to update settings for this module');
			throw new Error(err);
		}

		let fieldData: SettingsExecuteResponse = await res.json();

		settings.fields[index] = {
			...settings.fields[index],
			...fieldData.fields[0]
		};
		columnField = structuredClone(settings.fields[index]);
		settings = settings;
	};

	const deleteRow = async () => {
		const creds = getAuthCreds();
		if (!creds) throw new Error('No auth credentials found');

		let payload: SettingsExecute = {
			operation: 'Delete',
			module: module.id,
			setting: configOpt.id,
			fields: {
				[configOpt.primary_key]: settings.fields[index][configOpt.primary_key]
			}
		};

		let res = await fetchClient(`${get('splashtail')}/guilds/${guildId}/settings`, {
			method: 'POST',
			auth: creds.token,
			body: JSON.stringify(payload)
		});

		if (!res.ok) {
			let err = await res.error('Failed to delete settings for this module');
			throw new Error(err);
		}

		settings.fields.splice(index, 1);
		settings = settings;
	};

	let noticeProps: NoticeProps | null = null;
</script>

<details
	id={`setting-schema-details-${settings.fields[index][configOpt.primary_key]}`}
	class="setting-schema__details border p-2 bg-black hover:bg-slate-900"
>
	<summary class="setting-schema__summary hover:cursor-pointer"
		>{templateToStringLite(configOpt.title_template, columnField)}</summary
	>
	<div id="action-box" class="mb-3 border rounded-md">
		<button
			on:click={() => {
				if (currentOperationType === 'Update') {
					currentOperationType = 'View';
				} else {
					currentOperationType = 'Update';
				}
			}}
			class="text-white hover:text-gray-300 focus:outline-none px-2 py-3 border-r"
		>
			<Icon icon={'mdi:pen'} class={'text-2xl inline-block align-bottom'} />
			{currentOperationType === 'Update' ? 'Close Editor' : 'Edit'}
		</button>
	</div>

	{#each configOpt.columns as column}
		{#await getDataAsync(settings.fields[index], column, configOpt, currentOperationType)}
			<Message type="loading">Loading column data for {column.id}</Message>
		{:then data}
			{#if data.columnState != ColumnState.Hidden}
				<SettingsColumn
					{configOpt}
					{module}
					{guildId}
					{columnField}
					bind:value={columnField[column.id]}
					{currentOperationType}
					{column}
					columnState={data.columnState}
					columnDispatchType={data.dispatchType}
					{debugMode}
					bind:allDerivedData
				/>
				<Spacer typ="extSpacing" />
			{/if}
		{/await}
	{/each}

	{#if columnField['__message']}
		<NoticeArea props={{ text: columnField['__message'], level: 'info' }} />
	{/if}

	{#if currentOperationType === 'Update' && !isEqual(columnField, settings.fields[index])}
		<!--TODO: Only show the buttonreact when theres an actual change-->
		<ButtonReact
			color={Color.Themable}
			icon="mdi:edit"
			text="Save Changes"
			states={{
				loading: 'Saving...',
				success: 'Saved!',
				error: 'Failed to save'
			}}
			onClick={editRow}
			bind:noticeProps
		/>
	{/if}

	<Spacer typ="extSpacing" />

	{#if currentOperationType === 'Update'}
		<ButtonReact
			color={Color.Red}
			icon="mdi:delete"
			text="Delete"
			states={{
				loading: 'Deleting...',
				success: 'Deleted!',
				error: 'Failed to delete'
			}}
			onClick={deleteRow}
			bind:noticeProps
		/>
	{/if}

	{#if debugMode}
		<p>{JSON.stringify(settings.fields[index])} {JSON.stringify(columnField)}</p>
	{/if}

	{#if noticeProps}
		<NoticeArea props={noticeProps} />
	{/if}
</details>
