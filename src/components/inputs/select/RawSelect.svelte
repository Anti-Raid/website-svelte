<script lang="ts">
	import { ChangeEventHandler } from 'svelte/elements';
	import type { SMOption } from './select';

	export let id: string;
	export let choices: SMOption[];
	export let required: boolean = true;
	export let disabled: boolean = false;
	export let disabledDefaultInput = false;
	export let defaultLabel: string = 'Select an action';
	export let value: string = '';
	export let onChange: ChangeEventHandler<HTMLSelectElement> | undefined = undefined;
</script>

<select
	{id}
	class={disabled
		? 'w-full text-left mx-auto flex bg-surface-600 bg-opacity-50 text-gray-100 border border-primary-200 font-bold font-monster focus:outline-none py-4 px-6 rounded-xl'
		: 'w-full text-left mx-auto flex transition duration-200 hover:bg-surface-700 bg-surface-600 text-white font-bold font-monster border border-primary-200 focus:border-surface-800 focus:outline-none py-4 px-6 rounded-xl'}
	bind:value
	{required}
	{disabled}
	aria-disabled={disabled}
	aria-required={required}
	on:change={onChange}
>
	<option value="" disabled={disabledDefaultInput}>{defaultLabel}</option>
	{#each choices as choice}
		<option
			class="font-bold font-monster"
			id={choice.id}
			value={choice.value}
			disabled={choice.disabled || false}>{choice.label}</option
		>
	{/each}
</select>
