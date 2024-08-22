<script lang="ts">
	import {
		CanonicalColumn,
		CanonicalConfigOption,
		CanonicalModule
	} from '$lib/generated/silverpelt';
	import { getDispatchType, deriveColumnState, ColumnState, DispatchType } from '$lib/ui/settings';
	import InputDispatcher from '../inputs/generic/InputDispatcher.svelte';
	import SettingsSuggestionBox from './SettingsSuggestionBox.svelte';
	import { DerivedData, OperationTypes } from './types';
	import logger from '$lib/ui/logger';
	import BoxButton from '../inputs/button/BoxButton.svelte';
	import Spacer from '../inputs/Spacer.svelte';
	import { UserGuildBaseData } from '$lib/generated/types';

	export let clusterModules: Record<string, CanonicalModule>;
	export let configOpt: CanonicalConfigOption;
	export let module: CanonicalModule;
	export let guildData: UserGuildBaseData;
	export let guildId: string;
	export let columnField: Record<string, any>;
	export let value: any;
	export let currentOperationType: OperationTypes;
	export let column: CanonicalColumn;
	export let debugMode: boolean;
	export let allDerivedData: { [key: string]: DerivedData };

	let columnState: ColumnState;
	let columnDispatchType: DispatchType;
	let fieldList: string[] | undefined = undefined;

	// Function to initialize or update column state and dispatch type
	const initialize = () => {
		columnState = deriveColumnState(configOpt, column, currentOperationType);
		columnDispatchType = getDispatchType(columnField, column);
	};

	// Function to flag columns that need to be re-rendered
	const flagRerenders = () => {
		if (fieldList === undefined) {
			fieldList = [];
			for (let key in allDerivedData) {
				if (
					key !== column.id &&
					allDerivedData[key].dispatchType.referenced_variables?.includes(column.id)
				) {
					fieldList.push(key);
				}
			}
		}

		fieldList.forEach((key) => {
			allDerivedData[key].forceRederive = true;
		});
	};

	// Function to rederive column state and dispatch type if forced
	const rederiveIfForced = () => {
		if (allDerivedData[column.id].forceRederive) {
			logger.debug('rederiveIfForced', 'Rederiving for', column.id);
			columnState = deriveColumnState(configOpt, column, currentOperationType);
			columnDispatchType = getDispatchType(columnField, column);
			allDerivedData[column.id].forceRederive = false;
		}
	};

	// Watcher-like function to simulate reactive behavior
	const updateState = () => {
		flagRerenders();
		rederiveIfForced();
	};

	// Call initialize on component mount
	initialize();

	// Simulate reactive behavior by calling updateState when value or forceRederive changes
	$: {
		updateState();
	}
</script>

{#if columnDispatchType?.resolved_column_type?.Scalar || columnDispatchType?.resolved_column_type?.Array}
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
		bitflagValues={columnDispatchType?.bitflag_values}
		multiple={!!columnDispatchType?.resolved_column_type?.Array}
	/>
{/if}

{#if columnState == ColumnState.Enabled && !!column.suggestions.None}
	<SettingsSuggestionBox
		{guildId}
		{module}
		{configOpt}
		{column}
		operationType={currentOperationType}
		{clusterModules}
		bind:value
	/>
{/if}

{#if columnState == ColumnState.Enabled}
	{#if column.nullable && currentOperationType == 'Update'}
		<Spacer typ="smallSpacing" />
		<BoxButton
			onclick={(e) => {
				e.preventDefault();
				allDerivedData[column.id].isCleared = true;
				updateState(); // Manually trigger update after clearing
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
