<script lang="ts">
	import Label from '../../../inputs/Label.svelte';
	import BoxButton from '../../../inputs/button/BoxButton.svelte';
	import EmbedFieldElement from '../message/EmbedFieldElement.svelte';
	import { EmbedField } from './types';

	export let id: string;
	export let values: EmbedField[] = [];
	export let placeholder: string;
	export let minlength: number;
	export let showErrors: boolean = false;
	export let required: boolean = true;
	export let disabled: boolean = false;

	const deleteValue = (i: number) => {
		values = values.filter((_, index) => index !== i);
	};

	const addValue = (i: number) => {
		values = [
			...values.slice(0, i + 1),
			{ name: '', value: '', inline: false },
			...values.slice(i + 1)
		];
	};
</script>

<Label {id} label="Embed Field" />
<div {id}>
	{#each values as value, i}
		<EmbedFieldElement
			{placeholder}
			{minlength}
			{showErrors}
			{i}
			bind:value
			{required}
			{disabled}
		/>
		<BoxButton onClick={() => deleteValue(i)}>Delete</BoxButton>
		<BoxButton onClick={() => addValue(i)}>Add</BoxButton>
	{/each}

	{#if values.length == 0}
		<BoxButton onClick={() => addValue(-1)}>New Embed Field</BoxButton>
	{/if}
</div>
