<script lang="ts">
	import Label from '../../../inputs/Label.svelte';
	import ButtonReact from '../../../inputs/multi/Button.svelte';
	import DangerButton from '../../../inputs/multi/DangerButton.svelte';
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
		<DangerButton onclick={() => deleteValue(i)}>Delete</DangerButton>
		<ButtonReact onclick={() => addValue(i)}>Add</ButtonReact>
	{/each}

	{#if values.length == 0}
		<ButtonReact onclick={() => addValue(-1)}>New Embed Field</ButtonReact>
	{/if}
</div>
