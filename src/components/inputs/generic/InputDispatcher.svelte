<!--Generic input dispatcher for handling inputs where type is a string (non-concrete dynamic inputs)

Note: this may be less performant than using the concrete input components directly. Only use where dynamic inputs are required.
-->
<script lang="ts">
	import Icon from '@iconify/svelte';
	import BoolInput from '../BoolInput.svelte';
	import InputNumber from '../InputNumber.svelte';
	import InputText from '../InputText.svelte';
	import InputTextArea from '../InputTextArea.svelte';
	import Label from '../Label.svelte';
	import Select from '../select/Select.svelte';
	import Spacer from '../Spacer.svelte';

	export let type: string;

	export let id: string;
	export let label: string;
	export let placeholder: string;
	export let minlength: number | undefined;
	export let maxlength: number | undefined;
	export let description: string | undefined;
	export let value: any;
	export let showErrors: boolean = true;
	export let disabled: boolean = false;
	export let choices: { [label: string]: string } | undefined;
	export let multiple: boolean = false;

	// Needed for choices
	// choices must be in format label:value
	const getChoices = (choices: { [label: string]: string }) => {
		return Object.keys(choices).map((label) => {
			return {
				id: label.replaceAll(' ', '-'),
				value: choices[label],
				label: label
			};
		});
	};

	// Multi
	const defaultValue = () => {
		if (type == 'boolean') return false;
		if (type == 'number') return 0;
		return '';
	};

	const deleteValue = (i: number) => {
		value = (value || []).filter((_: any, index: number) => index !== i);
	};

	const addValue = (i: number) => {
		value = [...value.slice(0, i + 1), defaultValue(), ...value.slice(i + 1)];
	};

	const appendValue = () => {
		value = [...value, defaultValue()];
	};
</script>

{#if multiple}
	<div class="items-center justify-center col-span-9">
		<Label {id} {label} />

		{#if !disabled}
			<button class="text-lg" type="button" on:click|preventDefault={() => appendValue()}>
				<Icon inline={true} icon="ant-design:plus-circle-outlined" class="mr-1 text-white" />
				Add Other
			</button>
			<button
				class="text-lg"
				type="button"
				on:click|preventDefault={() => {
					let i = prompt('Enter the position to add the new value');
					if (i) {
						addValue(parseInt(i));
					}
				}}
			>
				<Icon inline={true} icon="ant-design:plus-circle-outlined" class="mr-1 text-white" />
				Add At Position
			</button>
		{/if}
	</div>
	{#if value}
		<Spacer typ="extSpacing" />
		{#each value as _, i}
			<div class="flex flex-row items-center justify-center multi-input align-items">
				<svelte:self
					{type}
					id={id + '-' + i}
					label=""
					{placeholder}
					{minlength}
					{maxlength}
					description=""
					bind:value={value[i]}
					{showErrors}
					{disabled}
					{choices}
					multiple={false}
				/>

				<div class="inline-block mt-2 ml-1 text-red-400 align-bottom hover:text-red-500">
					<button type="button" on:click|preventDefault={() => deleteValue(i)} aria-label="Delete">
						<Icon icon="ant-design:delete-outlined" class="text-2xl text-white" />
						Delete
					</button>
				</div>
			</div>
		{/each}
	{:else}
		<p class="text-gray-200">No values added</p>
	{/if}
{:else if type == 'number'}
	<InputNumber
		{id}
		{label}
		{placeholder}
		minlength={minlength || 0}
		{maxlength}
		{description}
		bind:value
		{showErrors}
		{disabled}
	/>
{:else if type == 'boolean'}
	<BoolInput
		{id}
		{label}
		description={description || 'Unknown description'}
		bind:value
		{disabled}
		onChange={() => {}}
	/>
{:else if type == 'textarea'}
	<InputTextArea
		{id}
		{label}
		{placeholder}
		minlength={minlength || 0}
		{maxlength}
		{description}
		bind:value
		{showErrors}
		{disabled}
	/>
{:else if type == 'string:template'}
	<InputTextArea
		{id}
		{label}
		{placeholder}
		minlength={minlength || 0}
		{maxlength}
		{description}
		bind:value
		{showErrors}
		{disabled}
	/>
	<small class="text-gray-500 dark:text-gray-400"
		>See our documentation to learn more about templating</small
	>
{:else}
	{#if choices}
		<Select
			{id}
			{label}
			{description}
			choices={getChoices(choices)}
			bind:value
			onChange={() => {}}
			{disabled}
		/>
	{:else}
		<!--Text, any unsupported field type-->
		<InputText
			{id}
			{label}
			{placeholder}
			minlength={minlength || 0}
			{maxlength}
			{description}
			bind:value
			{showErrors}
			{disabled}
		/>
	{/if}

	<!--keepme-->
{/if}
