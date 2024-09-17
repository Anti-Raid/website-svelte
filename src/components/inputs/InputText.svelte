<script lang="ts">
	import InputDescription from './InputDescription.svelte';
	import Label from './Label.svelte';

	export let id: string;
	export let label: string;
	export let placeholder: string;
	export let minlength: number;
	export let maxlength: number | undefined = undefined;
	export let value: string = '';
	export let extClass: string | undefined = undefined;
	export let showErrors: boolean = true;
	export let description: string = '';
	export let required: boolean = true;
	export let disabled: boolean = false;
	export let onChange: (() => void) | undefined = undefined;

	let success: boolean | null = null;

	let errorMsg = '';

	function checkLength() {
		if (onChange) {
			onChange();
		}

		if (!showErrors) return;

		if (!value) {
			success = null;
			return;
		}

		if (value.length < minlength) {
			success = false;
			errorMsg = `Must be at least ${minlength} characters long`;
		} else if (maxlength && value.length > maxlength) {
			success = false;
			errorMsg = `Must be at most ${maxlength} characters long`;
		} else {
			success = true;
		}
	}
</script>

<Label {id} {label} />
<InputDescription {description} />

<input
	on:change={checkLength}
	{minlength}
	{maxlength}
	type="text"
	{id}
	class="{disabled
		? 'mt-2 w-[30%] flex bg-surface-600/50 bg-opacity-30 text-gray-100 rounded-xl border border-primary-200 opacity-75 py-3 px-3 disabled cursor-not-allowed'
		: 'mt-2 w-[30%] flex transition duration-200 hover:bg-surface-700 bg-surface-600 bg-opacity-100 text-white font-semibold font-monster rounded-xl border border-primary-200 focus:outline-none py-3 px-3'} {extClass}"
	{placeholder}
	{required}
	{disabled}
	aria-disabled={disabled}
	aria-required={required}
	bind:value
/>

{#if success == true}
	<p class="text-sm text-success-600 dark:text-success-500">
		<span class="font-medium">Looks good!</span>
	</p>
{:else if success == false}
	<p class="text-sm text-red-600 dark:text-red-500">
		<span class="font-medium">{errorMsg}</span>
	</p>
{/if}
<slot />
