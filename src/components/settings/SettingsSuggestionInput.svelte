<script lang="ts">
	import { CanonicalColumn } from '$lib/generated/silverpelt';
	import Select from '../inputs/select/Select.svelte';

	interface Suggestion {
		id: string;
		label: string;
		value: string;
	}

	export let suggestions: Suggestion[];
	export let column: CanonicalColumn;
	export let value: string | string[];

	// This stores the value of the field and should be binded to
	let dummyValue = ''; // needed for select suggestions to work

	// For better UX, we switch between buttons and select when the number of suggestions is too large
	const maxElementsForButtons = 20;
</script>

{#if suggestions.length <= maxElementsForButtons}
	{#each suggestions as suggestion}
		{#if !(value == suggestion.value) && !(Array.isArray(value) && value.includes(suggestion.value))}
			<button
				id={`suggestion-${suggestion.id}`}
				class="inline-block p-1 mt-2 mr-3 bg-gray-600 text-white"
				on:click={(evt) => {
					evt?.preventDefault();
					if (column?.column_type?.Array) {
						if (!Array.isArray(value)) value = [suggestion.value];
						else value = [...value, suggestion.value];
					} else {
						value = suggestion.value;
					}
				}}
			>
				{suggestion.label}
			</button>
		{/if}
	{/each}
{:else}
	<Select
		id={`select-${column.id}--suggestions`}
		label="Some suggestions"
		bind:value={dummyValue}
		choices={suggestions
			.filter((suggestion) => {
				return (
					!(value == suggestion.value) &&
					!(Array.isArray(value) && value.includes(suggestion.value))
				);
			})
			.map((suggestion) => {
				return { id: suggestion.id, label: suggestion.label, value: suggestion.value };
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
