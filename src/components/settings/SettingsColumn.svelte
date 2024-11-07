<script lang="ts">
	import {
		CanonicalColumn,
		CanonicalConfigOption,
		CanonicalModule
	} from '$lib/generated/silverpelt';
	import { deriveColumnState, ColumnState, DispatchType } from '$lib/ui/settings';
	import InputDispatcher from '../inputs/generic/InputDispatcher.svelte';
	import SettingsSuggestionBox from './SettingsSuggestionBox.svelte';
	import { DerivedData, OperationTypes } from '$lib/ui/settings';
	import BoxButton from '../inputs/button/BoxButton.svelte';
	import Spacer from '../inputs/Spacer.svelte';
	import { UserGuildBaseData } from '$lib/generated/types';
	import Debug from '../common/Debug.svelte';

	export let modules: Record<string, CanonicalModule>;
	export let configOpt: CanonicalConfigOption;
	export let module: CanonicalModule;
	export let guildData: UserGuildBaseData;
	export let guildId: string;
	export let value: any;
	export let derivedData: DerivedData;
	export let currentOperationType: OperationTypes;
	export let column: CanonicalColumn;
	export let columnState: ColumnState;
	export let columnDispatchType: DispatchType;
</script>

{#if columnDispatchType?.resolved_column_type?.Scalar || columnDispatchType?.resolved_column_type?.Array}
	<InputDispatcher
		{guildData}
		{guildId}
		id={column.id}
		label={column.name}
		placeholder={column.description}
		description={column.description}
		minlength={columnDispatchType?.minlength}
		maxlength={columnDispatchType?.maxlength}
		type={columnDispatchType?.type}
		required={column.ignored_for.includes(currentOperationType) ? false : !column.nullable}
		disabled={columnState == ColumnState.Disabled || derivedData.isCleared}
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
		{modules}
		bind:value
	/>
{/if}

{#if columnState == ColumnState.Enabled}
	{#if column.nullable && currentOperationType == 'Update'}
		<Spacer typ="smallSpacing" />
		<BoxButton
			onClick={(e) => {
				e.preventDefault();
				derivedData.isCleared = !derivedData.isCleared;
			}}
		>
			{derivedData.isCleared ? "Don't Clear" : 'Clear'}
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
