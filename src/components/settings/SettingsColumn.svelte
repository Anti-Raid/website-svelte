<script lang="ts">
	import { CanonicalColumn, CanonicalConfigOption } from '$lib/generated/silverpelt';
	import { deriveColumnState, ColumnState, DispatchType } from '$lib/ui/settings';
	import InputDispatcher from '../inputs/generic/InputDispatcher.svelte';
	import { DerivedData, OperationTypes } from '$lib/ui/settings';
	import BoxButton from '../inputs/button/BoxButton.svelte';
	import Spacer from '../inputs/Spacer.svelte';
	import { UserGuildBaseData } from '$lib/generated/types';
	import Debug from '../common/Debug.svelte';
	import SettingsSuggestionInput from './SettingsSuggestionInput.svelte';

	export let configOpt: CanonicalConfigOption;
	export let guildData: UserGuildBaseData;
	export let guildId: string;
	export let value: any;
	export let derivedData: DerivedData;
	export let currentOperationType: OperationTypes;
	export let column: CanonicalColumn;
	export let columnState: ColumnState;
	export let columnDispatchType: DispatchType;
</script>

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
	disabled={columnState == ColumnState.Disabled ||
		derivedData.isCleared ||
		!configOpt.operations.includes(currentOperationType)}
	bind:value
	showErrors={true}
	choices={columnDispatchType?.allowed_values}
	channelConstraints={columnDispatchType?.channel_constraints}
	bitflagValues={columnDispatchType?.bitflag_values}
	multiple={!!columnDispatchType?.resolved_column_type?.Array}
	extClass={''}
/>

{#if columnState == ColumnState.Enabled}
	{#if column.suggestions.Static}
		<div class="configopts-suggestions--static">
			<SettingsSuggestionInput
				{column}
				bind:value
				suggestions={column.suggestions.Static.suggestions.map((suggestion) => {
					return {
						id: suggestion,
						label: suggestion,
						value: suggestion
					};
				})}
			/>
		</div>
	{/if}
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
