<script lang="ts">
	import { makeSharedRequest, opGetSettingsSuggestions } from '$lib/fetch/ext';
	import { CanonicalColumn, CanonicalConfigOption } from '$lib/generated/silverpelt';
	import logger from '$lib/ui/logger';
	import NoticeArea from '../../../../components/common/noticearea/NoticeArea.svelte';
	import Select from '../../../../components/inputs/select/Select.svelte';
	import Message from '../../../../components/Message.svelte';
	import { OperationTypes } from './types';

	export let guildId: string;
	export let module: string;
	export let configOpt: CanonicalConfigOption;
	export let operationType: OperationTypes;
	export let column: CanonicalColumn;

	// This stores the value of the field and should be binded to
	export let value: any;
	let dummyValue = ''; // needed for select suggestions to work

	$: logger.info('SettingsSuggestionBox', {
		guildId,
		module,
		configOpt,
		operationType,
		column,
		value
	});

	// For better UX, we switch between buttons and select when the number of suggestions is too large
	const maxElementsForButtons = 20;
</script>

{#if column.suggestions.Static}
	<div class="configopts-suggestions--static">
		{#if column.suggestions.Static.suggestions.length <= maxElementsForButtons}
			{#each column.suggestions.Static.suggestions as suggestion}
				{#if !(value == suggestion) && !(Array.isArray(value) && value.includes(suggestion))}
					<button
						class="inline-block p-1 mt-2 mr-3 bg-gray-600 text-white"
						on:click={(evt) => {
							evt?.preventDefault();
							if (column?.column_type?.Array) {
								if (!Array.isArray(value)) value = [suggestion];
								else value = [...value, suggestion];
							} else {
								value = suggestion;
							}
						}}
					>
						{suggestion}
					</button>
				{/if}
			{/each}
		{:else}
			<Select
				id={`select-${column.id}--suggestions`}
				label="Some suggestions"
				bind:value={dummyValue}
				choices={column.suggestions.Static.suggestions
					.filter((suggestion) => {
						return !(value == suggestion) && !(Array.isArray(value) && value.includes(suggestion));
					})
					.map((suggestion) => {
						return { id: suggestion, label: suggestion, value: suggestion };
					})}
				onChange={(evt) => {
					evt?.preventDefault();
					dummyValue = '';
					// @ts-ignore
					let suggestion = evt?.target?.value;
					if (!suggestion) return;
					if (column?.column_type?.Array) {
						if (!Array.isArray(value)) value = [suggestion];
						else value = [...value, suggestion];
					} else {
						value = suggestion;
					}
				}}
			/>
		{/if}
	</div>
{:else if column.suggestions.Dynamic}
	{#await makeSharedRequest(opGetSettingsSuggestions( guildId, { module, column: column.id, operation: operationType, setting: configOpt.id } ))}
		<Message type="loading">Loading suggestions...</Message>
	{:then suggestions}
		<div class="configopts-suggestions--dynamic">
			{#each suggestions.suggestions || [] as suggestion}
				<button
					class="inline-block p-1 mt-2 mr-3 bg-gray-600 text-white"
					on:click={(evt) => {
						evt?.preventDefault();
						if (column?.column_type?.Array) {
							if (!Array.isArray(value)) value = [suggestion.id];
							else value = [...value, suggestion.id];
						} else {
							value = suggestion.id;
						}
					}}
				>
					{suggestion.value} <span class="text-xs opacity-80">({suggestion.id})</span>
				</button>
			{/each}
		</div>
	{:catch err}
		<NoticeArea
			props={{
				text: err?.message || err?.toString() || 'Failed to fetch suggestions',
				level: 'error'
			}}
		/>
	{/await}
{/if}
