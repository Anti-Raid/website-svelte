<script lang="ts">
	import { makeSharedRequest, opGetSettingsSuggestions } from '$lib/fetch/ext';
	import { CanonicalColumn, CanonicalConfigOption } from '$lib/generated/silverpelt';
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
</script>

<!--View/Delete do not support suggestions in the first place-->
{#if operationType != 'View' && operationType != 'Delete'}
	{#if column.suggestions.Static}
		<slot />
		<div class="configopts-suggestions--static">
			{#each column.suggestions.Static.suggestions as suggestion}
				<button
					class="inline-block p-1 mt-2 mr-3 bg-gray-600 text-white"
					on:click={(evt) => {
						evt?.preventDefault();
						value = suggestion;
					}}
				>
					{suggestion}
				</button>
			{/each}
		</div>
	{:else if column.suggestions.Dynamic}
		<slot />
		{#await makeSharedRequest(opGetSettingsSuggestions( guildId, { module, column: column.id, operation: operationType, setting: configOpt.id } ))}
			<Message type="loading">Loading suggestions...</Message>
		{:then suggestions}
			<div class="configopts-suggestions--dynamic">
				{#each suggestions.suggestions || [] as suggestion}
					<button
						class="inline-block p-1 mt-2 mr-3 bg-gray-600 text-white"
						on:click={(evt) => {
							evt?.preventDefault();
							value = suggestion.id;
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
{/if}
