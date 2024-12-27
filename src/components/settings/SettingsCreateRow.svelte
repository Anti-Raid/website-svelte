<script lang="ts">
	import { CanonicalColumn, CanonicalConfigOption } from '$lib/generated/silverpelt';
	import {
		getDispatchType,
		deriveColumnState,
		templateToStringLite,
		ColumnState,
		createFieldsForCreate
	} from '$lib/ui/settings';
	import Icon from '@iconify/svelte';
	import { DerivedData, OperationTypes } from '$lib/ui/settings';
	import Message from '../Message.svelte';
	import SettingsColumn from './SettingsColumn.svelte';
	import { fetchClient } from '$lib/fetch/fetch';
	import { get } from '$lib/configs/functions/services';
	import { getAuthCreds } from '$lib/auth/getAuthCreds';
	import { SettingsExecuteResponse, UserGuildBaseData } from '$lib/generated/types';
	import ButtonReact from '../inputs/button/ButtonReact.svelte';
	import { Color } from '../inputs/button/colors';
	import { NoticeProps } from '../common/noticearea/noticearea';
	import NoticeArea from '../common/noticearea/NoticeArea.svelte';
	import Spacer from '../inputs/Spacer.svelte';
	import Debug from '../common/Debug.svelte';

	export let configOpt: CanonicalConfigOption;
	export let settings: SettingsExecuteResponse;
	export let guildData: UserGuildBaseData;
	export let guildId: string;
	export let columnField: Record<string, any> = {};

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

		let payload = createFieldsForCreate(columnField, configOpt);

		let res = await fetchClient(`${get('splashtail')}/guilds/${guildId}/settings`, {
			method: 'POST',
			auth: creds.token,
			body: JSON.stringify(payload)
		});

		if (!res.ok) {
			let err = await res.error('Failed to create new setting entry!');
			throw new Error(err);
		}

		let newEntry: SettingsExecuteResponse = await res.json();

		let newLength = settings.fields.push(newEntry.fields[0]);
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

	const stripPunctuation = (str: string) => {
		if (str.endsWith('s')) {
			return str.slice(0, -1);
		}

		return str;
	};
</script>

<details
	id="setting-schema-createrowelement"
	class="setting-schema-create__details border border-surface-400 p-2 bg-surface-500/65 hover:bg-surface-500/75 rounded-t-lg"
	bind:this={createRowElement}
>
	<summary
		class="setting-schema-create__summary hover:cursor-pointer font-semibold text-xl items-center align-middle justify-center break-words"
	>
		<Icon
			icon="fa6-solid:plus"
			class="inline-block m-0 p-0 mb-1 font-semibold mr-1 align-middle"
		/>New {stripPunctuation(configOpt.name)}
	</summary>

	{#each configOpt.columns as column}
		{#await getDataAsync({}, column, configOpt, currentOperationType)}
			<Message type="loading">Loading column data for {column.id}</Message>
		{:then data}
			{#if data.columnState != ColumnState.Hidden}
				<SettingsColumn
					{configOpt}
					{guildData}
					{guildId}
					bind:value={columnField[column.id]}
					{currentOperationType}
					{column}
					columnState={data.columnState}
					columnDispatchType={data.dispatchType}
					bind:derivedData={allDerivedData[column.id]}
				/>
				<Spacer typ="extSpacing" />
			{/if}
		{/await}
	{/each}

	<Spacer typ="extSpacing" />

	<Debug data={columnField} />

	<Spacer typ="extSpacing" />

	{#if currentOperationType === 'Create'}
		<ButtonReact
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
