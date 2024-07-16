<script lang="ts">
	import { ChangeEventHandler } from 'svelte/elements';
	import Label from '../Label.svelte';
	import type { SMOption } from './select';
	import RawSelect from './RawSelect.svelte';

	export let id: string;
	export let label: string;
	export let description: string = '';
	export let choices: SMOption[];
	export let required: boolean = true;
	export let disabled: boolean = false;
	export let disabledDefaultInput = false;
	export let inpClass: string = '';
	export let defaultLabel: string = 'Select an action';
	export let value: string = '';
	export let onChange: ChangeEventHandler<HTMLSelectElement> | undefined = undefined;
</script>

<div class={inpClass}>
	<Label {id} {label} />
	{#if description}
		<p class="text-md mb-2 opacity-80">{@html description}</p>
	{/if}
	<RawSelect
		{id}
		{choices}
		{required}
		{disabled}
		{disabledDefaultInput}
		{defaultLabel}
		bind:value
		{onChange}
	/>
</div>
