<script lang="ts">
	import { makeSharedRequest, opGetSettingsSuggestions } from '$lib/fetch/ext';
	import { CanonicalColumn, CanonicalConfigOption } from '$lib/generated/silverpelt';
	import logger from '$lib/ui/logger';
	import NoticeArea from '../../../../components/common/noticearea/NoticeArea.svelte';
	import Message from '../../../../components/Message.svelte';
	import { OperationTypes } from './types';

	export let guildId: string;
	export let module: string;
	export let configOpt: CanonicalConfigOption;
	export let operationType: OperationTypes;
	export let column: CanonicalColumn;

	// This stores the value of the field and should be binded to
	export let value: any;

	$: logger.info('SettingsSuggestionBox', {
		guildId,
		module,
		configOpt,
		operationType,
		column,
		value
	});
</script>

{#if column.suggestions.Static}
	<div class="configopts-suggestions--static">
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
