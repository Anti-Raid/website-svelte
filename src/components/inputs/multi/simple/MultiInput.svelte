<script lang="ts">
	import Input from '../../InputTextArea.svelte';
	import InputSm from '../../InputText.svelte';
	import Label from '../../Label.svelte';
	import Icon from '@iconify/svelte';
	import Spacer from '../../Spacer.svelte';

	export let id: string;
	export let values: string[];
	export let title: string;
	export let label: string = title;
	export let placeholder: string;
	export let minlength: number;
	export let small: boolean = true;
	export let showErrors: boolean = false;
	export let showLabel: boolean = true;
	export let required: boolean = true;
	export let disabled: boolean = false;

	const deleteValue = (i: number) => {
		values = values.filter((_, index) => index !== i);
	};

	const addValue = (i: number) => {
		values = [...values.slice(0, i + 1), '', ...values.slice(i + 1)];
	};

	const appendValue = () => {
		values = [...values, ''];
	};
</script>

<div class="items-center justify-center col-span-9">
	{#if showLabel || values.length == 0}
		<Label {id} {label} />
	{:else}
		<label for={id} class="sr-only">{label}</label>
	{/if}

	{#if !disabled}
		<button
			class="text-lg mr-2 font-semibold font-monster hover:underline"
			type="button"
			on:click|preventDefault={() => appendValue()}
		>
			<Icon icon="zondicons:add-solid" class="inline-block mb-1 mr-1 text-white" />Add Other
		</button>

		<button
			class="text-lg mr-2 font-semibold font-monster hover:underline"
			type="button"
			on:click|preventDefault={() => {
				let i = prompt('Enter the position to add the new value');
				if (i) addValue(parseInt(i));
			}}
		>
			<Icon icon="zondicons:add-solid" class="inline-block mb-1 mr-1 text-white" />Add At Position
		</button>
	{/if}
</div>

<Spacer typ="extSpacing" />

{#each values as value, i}
	<div class="flex flex-row items-center justify-center multi-input align-items">
		{#if small}
			<InputSm
				id={i.toString()}
				label={''}
				{placeholder}
				bind:value
				{minlength}
				{showErrors}
				{required}
				{disabled}
			/>
		{:else}
			<Input
				id={i.toString()}
				label={title + ' ' + (i + 1)}
				{placeholder}
				bind:value
				{minlength}
				{showErrors}
				{required}
				{disabled}
			/>
		{/if}

		<div class="inline-block mt-2 ml-1 text-white align-bottom hover:underline">
			<button
				class="flex font-semibold font-monster uppercase"
				type="button"
				on:click|preventDefault={() => deleteValue(i)}
				aria-label="Delete"
			>
				<Icon icon="ant-design:delete-outlined" class="text-2xl text-white" />
				Delete
			</button>
		</div>
	</div>
{/each}

{#if values.length == 0}
	<p class="text-sm text-gray-200">No values added</p>
{/if}
