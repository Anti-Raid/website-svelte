<script lang="ts">
	import {
		CanonicalColumn,
		CanonicalConfigOption,
		CanonicalModule
	} from '$lib/generated/silverpelt';
	import { getDispatchType, deriveColumnState, ColumnState, DispatchType } from '$lib/ui/settings';
	import InputDispatcher from '../inputs/generic/InputDispatcher.svelte';
	import SettingsSuggestionBox from './SettingsSuggestionBox.svelte';
	import { DerivedData, OperationTypes } from '$lib/ui/settings';
	import logger from '$lib/ui/logger';
	import BoxButton from '../inputs/button/BoxButton.svelte';
	import Spacer from '../inputs/Spacer.svelte';
	import { UserGuildBaseData } from '$lib/generated/types';
	import Debug from '../common/Debug.svelte';

	export let clusterModules: Record<string, CanonicalModule>;
	export let configOpt: CanonicalConfigOption;
	export let module: CanonicalModule;
	export let guildData: UserGuildBaseData;
	export let guildId: string;
	export let columnField: Record<string, any>;
	export let value: any;
	export let currentOperationType: OperationTypes;
	export let column: CanonicalColumn;
	export let columnState: ColumnState;
	export let columnDispatchType: DispatchType;

	// Used to force re-render of dynamic_on columns
	export let allDerivedData: { [key: string]: DerivedData };

	// On column field change
	let fieldList: string[] | undefined = undefined;
	const flagRerenders = () => {
		if (fieldList === undefined) {
			fieldList = [];
			for (let key in allDerivedData) {
				if (
					key != column.id &&
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
		extClass={''}
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
			}}
		>
			{allDerivedData[column.id].isCleared ? "Don't Clear" : 'Clear'}
		</BoxButton>
	{/if}
{/if}

<Debug
	data={{
		currentOperationType,
		column,
		columnDispatchType,
		configOpt,
		viewColumnState: deriveColumnState(configOpt, column, 'View'),
		createColumnState: deriveColumnState(configOpt, column, 'Create'),
		updateColumnState: deriveColumnState(configOpt, column, 'Update'),
		deleteColumnState: deriveColumnState(configOpt, column, 'Delete'),
		isPkey: column.id == configOpt.primary_key,
		isNullable: column.nullable
	}}
/>
