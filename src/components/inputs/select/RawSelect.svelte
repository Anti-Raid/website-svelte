<script lang="ts">
	import { ChangeEventHandler } from 'svelte/elements';
	import Label from '../Label.svelte';
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
		? 'w-full mx-auto flex bg-black bg-opacity-50 text-gray-100 rounded-xl border border-white/10 focus:outline-none py-4 px-6'
		: 'w-full mx-auto flex transition duration-200 hover:bg-slate-900 bg-black bg-opacity-100 text-white focus:text-primary-400 rounded-xl border border-primary-200 focus:border-primary-400 focus:outline-none py-4 px-6'}
	bind:value
	{required}
	{disabled}
	aria-disabled={disabled}
	aria-required={required}
	on:change={onChange}
>
	<option value="" disabled={disabledDefaultInput}>{defaultLabel}</option>
	{#each choices as choice}
		<option id={choice.id} value={choice.value}>{choice.label}</option>
	{/each}
</select>
