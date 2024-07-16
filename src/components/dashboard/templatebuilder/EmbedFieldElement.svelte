<script lang="ts">
	import BoolInput from '../../inputs/BoolInput.svelte';
	import InputSm from '../../inputs/InputText.svelte';
	import Label from '../../inputs/Label.svelte';
	import { EmbedField } from './types';

	export let placeholder: string;
	export let minlength: number;
	export let showErrors: boolean = false;
	export let i: number;
	export let value: EmbedField;
	export let required: boolean = true;
	export let disabled: boolean = false;
</script>

<div class="flex flex-row items-center align-items justify-center">
	<div class="lg:pt-0 mr-5 block w-1/3">
		<InputSm
			id={i.toString() + '-k'}
			label={`Field ${i} Name`}
			{placeholder}
			bind:value={value.name}
			{minlength}
			{showErrors}
			{required}
			{disabled}
		/>
	</div>
	<div class="lg:pt-0 mr-5 block w-1/3">
		<InputSm
			id={i.toString() + '-v'}
			label={`Field ${i} Value`}
			{placeholder}
			bind:value={value.value}
			{minlength}
			{showErrors}
			{required}
			{disabled}
		/>
	</div>
	<div class="lg:pt-0 block w-1/3">
		<Label id={i.toString() + '-inline'} label="Inline" />
		<p class="text-sm opacity-80 font-semibold">Only applies to the Discord desktop app</p>
		<BoolInput
			id={i.toString() + '-inline'}
			label={`Inline`}
			description="Display this field inline with the rest of the embed fields"
			bind:value={value.inline}
			{required}
			{disabled}
			onChange={() => {}}
		/>
	</div>
</div>
