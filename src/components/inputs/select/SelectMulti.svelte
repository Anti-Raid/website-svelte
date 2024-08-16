<script lang="ts">
	import Label from '../Label.svelte';
	import type { SMOption } from './select';
	import RawSelectMulti from './RawSelectMulti.svelte';
	import InputDescription from '../InputDescription.svelte';

	export let id: string;
	export let label: string;
	export let description: string = '';
	export let choices: SMOption[];
	export let required: boolean = true;
	export let disabled: boolean = false;
	export let inpClass: string = '';
	export let defaultLabel: string = 'Select an action';
	export let value: string[] = [];
	export let maxLabels = 5;
</script>

<div class={inpClass}>
	<Label {id} {label} />
	<InputDescription {description} />
	<RawSelectMulti {id} {choices} {required} {disabled} {defaultLabel} {maxLabels} bind:value />
</div>
