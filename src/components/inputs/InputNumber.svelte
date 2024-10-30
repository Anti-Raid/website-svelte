<script lang="ts">
	import InputDescription from './InputDescription.svelte';
	import Label from './Label.svelte';

	export let id: string;
	export let label: string;
	export let placeholder: string;
	export let minlength: number | undefined = undefined;
	export let maxlength: number | undefined = undefined;
	export let value: number = 0;
	export let showErrors: boolean = true;
	export let description: string = '';
	export let inpClass: string = '';
	export let required: boolean = true;
	export let disabled: boolean = false;

	let success: boolean | null = null;
	let errorMsg = '';

	const checkLength = () => {
		if (!showErrors) return;
		if (!value) success = false;

		if (!minlength) success = true;
		else {
			if (value < 10 ** minlength) {
				success = false;
				errorMsg = `Must be at least ${minlength} characters long`;
			} else if (maxlength && value > 10 ** maxlength) {
				success = false;
				errorMsg = `Must be at most ${maxlength} characters long`;
			} else {
				success = true;
			}
		}
	};
</script>

<div class={inpClass}>
	<Label {id} {label} />
	<InputDescription {description} />

	<input
		on:change={checkLength}
		{minlength}
		{maxlength}
		type="number"
		{id}
		class="{disabled
			? 'disabled mt-2 overflow-auto flex transition duration-200 bg-surface-600 opacity-75 text-white font-semibold font-monster rounded-lg border border-primary-200 focus:outline-none py-3 px-3 placeholder:text-white cursor-not-allowed'
			: 'mt-2 overflow-auto flex transition duration-200 hover:bg-surface-700 bg-surface-600 text-white font-semibold font-monster rounded-lg border border-primary-200 focus:outline-none py-3 px-3 placeholder:text-white'} {inpClass}"
		{placeholder}
		{required}
		{disabled}
		aria-disabled={disabled}
		aria-required={required}
		bind:value
	/>

	{#if success == true}
		<p class="text-sm text-success-600">
			<span class="font-medium">Looks good!</span>
		</p>
	{:else if success == false}
		<p class="text-sm text-red-600">
			<span class="font-medium">{errorMsg}</span>
		</p>
	{/if}

	<slot />
</div>
