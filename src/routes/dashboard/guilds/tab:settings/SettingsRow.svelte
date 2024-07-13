<script lang="ts">
	import { CanonicalConfigOption, CanonicalModule } from '$lib/generated/silverpelt';
	import {
		getDispatchType,
		deriveColumnState,
		templateToStringLite,
		ColumnState
	} from '$lib/ui/settings';
	import Icon from '@iconify/svelte';
	import InputDispatcher from '../../../../components/inputs/generic/InputDispatcher.svelte';
	import SettingsSuggestionBox from './SettingsSuggestionBox.svelte';
	import { OperationTypes } from './types';

	export let configOpt: CanonicalConfigOption;
	export let module: CanonicalModule;
	export let guildId: string;
	export let columnField: Record<string, any>;
	export let currentOperationType: OperationTypes = 'View';
</script>

<details class="setting-schema__details border p-2 bg-black hover:bg-slate-900">
	<summary class="setting-schema__summary hover:cursor-pointer"
		>{templateToStringLite(configOpt.title_template, columnField)}</summary
	>
	<div id="action-box" class="mb-3 border rounded-md">
		<button
			on:click={() => {
				currentOperationType = 'Update';
			}}
			class="text-white hover:text-gray-300 focus:outline-none px-2 py-3 border-r"
		>
			<Icon icon={'mdi:pen'} class={'text-2xl inline-block align-bottom'} />
			Edit
		</button>
	</div>

	{#each configOpt.columns as column}
		{#if deriveColumnState(configOpt, column, currentOperationType) != ColumnState.Hidden}
			{#if column?.column_type?.Scalar}
				<InputDispatcher
					id={column.id}
					label={column.name}
					placeholder={column.description}
					description={column.description}
					minlength={getDispatchType(columnField, column)?.minlength}
					maxlength={getDispatchType(columnField, column)?.maxlength}
					type={getDispatchType(columnField, column)?.type}
					disabled={deriveColumnState(configOpt, column, currentOperationType) ==
						ColumnState.Disabled}
					bind:value={columnField[column.id]}
					showErrors={true}
					choices={getDispatchType(columnField, column)?.allowed_values}
				/>
			{:else if column?.column_type?.Array}
				<InputDispatcher
					id={column.id}
					label={column.name}
					placeholder={column.description}
					description={column.description}
					minlength={getDispatchType(columnField, column)?.minlength}
					maxlength={getDispatchType(columnField, column)?.maxlength}
					type={getDispatchType(columnField, column)?.type}
					disabled={deriveColumnState(configOpt, column, currentOperationType) ==
						ColumnState.Disabled}
					bind:value={columnField[column.id]}
					showErrors={true}
					choices={getDispatchType(columnField, column)?.allowed_values}
					multiple={true}
				/>
			{/if}

			{#if deriveColumnState(configOpt, column, currentOperationType) == ColumnState.Enabled}
				<SettingsSuggestionBox
					{guildId}
					module={module.id}
					{configOpt}
					{column}
					operationType={'Update'}
					bind:value={columnField[column.id]}
				/>
			{/if}

			<p class="configopt__debuginfo">
				{currentOperationType},
				{column.name} - {JSON.stringify(getDispatchType(columnField, column))} - View: {deriveColumnState(
					configOpt,
					column,
					'View'
				)}, Update: {deriveColumnState(configOpt, column, 'Update')}, Create: {deriveColumnState(
					configOpt,
					column,
					'Create'
				)}, Delete: {deriveColumnState(configOpt, column, 'Delete')}, isPkey: {column.id ==
					configOpt.primary_key}
			</p>
		{/if}
	{/each}
</details>
