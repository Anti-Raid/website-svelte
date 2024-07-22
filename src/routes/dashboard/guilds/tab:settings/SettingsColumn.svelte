<script lang="ts">
	import {
		CanonicalColumn,
		CanonicalConfigOption,
		CanonicalModule
	} from '$lib/generated/silverpelt';
	import { getDispatchType, deriveColumnState, ColumnState, DispatchType } from '$lib/ui/settings';
	import InputDispatcher from '../../../../components/inputs/generic/InputDispatcher.svelte';
	import SettingsSuggestionBox from './SettingsSuggestionBox.svelte';
	import { DerivedData, OperationTypes } from './types';
	import logger from '$lib/ui/logger';
	import BoxButton from '../../../../components/inputs/button/BoxButton.svelte';
	import Spacer from '../../../../components/inputs/Spacer.svelte';
	import { UserGuildBaseData } from '$lib/generated/types';

	export let configOpt: CanonicalConfigOption;
	export let module: CanonicalModule;
	export let guildData: UserGuildBaseData;
	export let guildId: string;
	export let columnField: Record<string, any>;
	export let value: any;
	export let currentOperationType: OperationTypes;
	export let column: CanonicalColumn;
	export let debugMode: boolean;
	export let columnState: ColumnState;
	export let columnDispatchType: DispatchType;

	// Used to force re-render of dynamic_on columns
	export let allDerivedData: { [key: string]: DerivedData };

	// On column field change
	let fieldList: string[] | undefined = undefined;
	const flagRerenders = () => {
		logger.debug('flagRerenders', 'Checking for rerenders for', column.id, allDerivedData);
		if (!fieldList) {
			fieldList = [];
			for (let key in allDerivedData) {
				if (key != column.id) {
					fieldList.push(key);
				}
			}
		}

		fieldList.forEach((key) => {
			allDerivedData[key].forceRederive = true;
		});
	};

	const rederive = () => {
		columnState = deriveColumnState(configOpt, column, currentOperationType);
		columnDispatchType = getDispatchType(columnField, column);
		allDerivedData[column.id].forceRederive = false;
	};

	const rederiveIfForced = () => {
		if (allDerivedData[column.id].forceRederive) {
			logger.debug('rederiveIfForced', 'Rederiving for', column.id);
			rederive();
		}
	};

	$: value, flagRerenders();
	$: allDerivedData[column.id].forceRederive, rederiveIfForced();
</script>

{#if columnDispatchType?.resolved_column_type?.Scalar}
	<InputDispatcher
		{guildData}
		id={column.id}
		label={column.name}
		placeholder={column.description}
		description={column.description}
		minlength={columnDispatchType?.minlength}
		maxlength={columnDispatchType?.maxlength}
		type={columnDispatchType?.type}
		disabled={columnState == ColumnState.Disabled || allDerivedData[column.id].isCleared}
		bind:value
		showErrors={true}
		choices={columnDispatchType?.allowed_values}
		channelConstraints={columnDispatchType?.channel_constraints}
	/>
{:else if columnDispatchType?.resolved_column_type?.Array}
	<InputDispatcher
		{guildData}
		id={column.id}
		label={column.name}
		placeholder={column.description}
		description={column.description}
		minlength={columnDispatchType?.minlength}
		maxlength={columnDispatchType?.maxlength}
		type={columnDispatchType?.type}
		disabled={columnState == ColumnState.Disabled || allDerivedData[column.id].isCleared}
		bind:value
		showErrors={true}
		choices={columnDispatchType?.allowed_values}
		channelConstraints={columnDispatchType?.channel_constraints}
		multiple={true}
	/>
{/if}

{#if columnState == ColumnState.Enabled}
	{#if !allDerivedData[column.id].isCleared}
		<SettingsSuggestionBox
			{guildId}
			module={module.id}
			{configOpt}
			{column}
			operationType={currentOperationType}
			bind:value
		/>
	{/if}

	{#if column.nullable && currentOperationType == 'Update'}
		<Spacer typ="smallSpacing" />
		<BoxButton
			onclick={(e) => {
				e.preventDefault();
				allDerivedData[column.id].isCleared = true;
			}}
		>
			{allDerivedData[column.id].isCleared ? "Don't Clear" : 'Clear'}
		</BoxButton>
	{/if}
{/if}

{#if debugMode}
	<p class="configopt__debuginfo">
		{currentOperationType},
		{column.name} - {JSON.stringify(columnDispatchType)} - View: {deriveColumnState(
			configOpt,
			column,
			'View'
		)}, Update: {deriveColumnState(configOpt, column, 'Update')}, Create: {deriveColumnState(
			configOpt,
			column,
			'Create'
		)}, Delete: {deriveColumnState(configOpt, column, 'Delete')}, isPkey: {column.id ==
			configOpt.primary_key}, isNullable: {column.nullable}
	</p>
{/if}
