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
	import Message from '../Message.svelte';
	import SettingsColumn from './SettingsColumn.svelte';
	import { fetchClient } from '$lib/fetch/fetch';
	import { get } from '$lib/configs/functions/services';
	import { getAuthCreds } from '$lib/auth/getAuthCreds';
	import {
		SettingsExecute,
		SettingsExecuteResponse,
		UserGuildBaseData
	} from '$lib/generated/types';
	import ButtonReact from '../inputs/button/ButtonReact.svelte';
	import { Color } from '../inputs/button/colors';
	import { NoticeProps } from '../common/noticearea/noticearea';
	import NoticeArea from '../common/noticearea/NoticeArea.svelte';
	import Spacer from '../inputs/Spacer.svelte';

	export let clusterModules: Record<string, CanonicalModule>;
	export let configOpt: CanonicalConfigOption;
	export let settings: SettingsExecuteResponse;
	export let module: CanonicalModule;
	export let guildData: UserGuildBaseData;
	export let guildId: string;
	export let columnField: Record<string, any> = {};
	export let debugMode: boolean;

	// The current operation type this row is under
	let currentOperationType: OperationTypes = 'Create';

	let allDerivedData: { [key: string]: DerivedData } = {};
	const getDataAsync = async (
		columnField: Record<string, any>,
		column: CanonicalColumn,
		configOpt: CanonicalConfigOption,
		currentOperationType: OperationTypes
	): Promise<DerivedData> => {
		let result: DerivedData = {
			dispatchType: getDispatchType(columnField, column),
			columnState: deriveColumnState(configOpt, column, currentOperationType),
			isCleared: false
		};

		allDerivedData[column.id] = result;

		return result;
	};

	let noticeProps: NoticeProps | null = null;

	let createRowElement: HTMLDetailsElement;
	const createRow = async () => {
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
			operation: 'Create',
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
			let err = await res.error('Failed to create new setting entry for this module');
			throw new Error(err);
		}

		let newEntry: SettingsExecuteResponse = await res.json();

		let newLength = settings.fields.push({
			...columnField,
			...newEntry.fields[0]
		});
		settings = settings;
		columnField = {}; // Clear the column field after creating a new entry

		// Keep looking for the newly created details element
		let newlyCreatedDetails = null;
		while (!newlyCreatedDetails) {
			// Sleep for 100ms
			await new Promise((r) => setTimeout(r, 100));
			newlyCreatedDetails = document.querySelector(
				`#setting-schema-details-${settings.fields[newLength - 1][configOpt.primary_key]}`
			);
		}

		if (newlyCreatedDetails) {
			newlyCreatedDetails.setAttribute('open', 'true');
			newlyCreatedDetails.scrollIntoView({ behavior: 'smooth' });
		}

		if (createRowElement) {
			createRowElement.setAttribute('open', 'false');
		} else {
			let details = null;
			while (!details) {
				// Sleep for 100ms
				await new Promise((r) => setTimeout(r, 100));
				details = document.querySelector(
					`#setting-schema-details-${settings.fields[newLength - 1][configOpt.primary_key]}`
				);
			}

			if (details) {
				details.setAttribute('open', 'false');
			}
		}
	};
</script>

<details
	id="setting-schema-createrowelement"
	class="setting-schema-create__details border p-2 bg-black hover:bg-slate-900"
	bind:this={createRowElement}
>
	<summary
		class="setting-schema-create__summary hover:cursor-pointer font-semibold text-xl items-center align-middle justify-center break-words"
	>
		<Icon
			icon="fa6-solid:plus"
			class="inline-block m-0 p-0 font-semibold mr-1 align-middle"
		/>Create New Entry
	</summary>

	{#each configOpt.columns as column}
		{#await getDataAsync({}, column, configOpt, currentOperationType)}
			<Message type="loading">Loading column data for {column.id}</Message>
		{:then data}
			{#if data.columnState != ColumnState.Hidden}
				<SettingsColumn
					{configOpt}
					{module}
					{guildData}
					{guildId}
					{columnField}
					bind:value={columnField[column.id]}
					{currentOperationType}
					{column}
					columnState={data.columnState}
					columnDispatchType={data.dispatchType}
					{debugMode}
					{clusterModules}
					bind:allDerivedData
				/>
				<Spacer typ="extSpacing" />
			{/if}
		{/await}
	{/each}

	<Spacer typ="extSpacing" />

	{#if debugMode}
		<p>{JSON.stringify(columnField)}</p>
	{/if}

	<Spacer typ="extSpacing" />

	{#if currentOperationType === 'Create'}
		<ButtonReact
			color={Color.Themable}
			icon="fa6-solid:plus"
			text={`Add ${configOpt.name}`}
			states={{
				loading: 'Creating entry...',
				success: 'Created entry!',
				error: 'Failed to create entry!'
			}}
			onClick={createRow}
			bind:noticeProps
		/>
	{/if}

	{#if noticeProps}
		<NoticeArea props={noticeProps} />
	{/if}
</details>
