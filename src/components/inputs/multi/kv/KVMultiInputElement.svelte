<script lang="ts">
	import InputSm from '../../InputText.svelte';

	export let kvFunc: (i: number, isKey: boolean) => string;
	export let placeholder: string;
	export let minlength: number;
	export let showErrors: boolean = false;
	export let i: number;
	export let value: [string, string];
	export let required: boolean = true;
	export let disabled: boolean = false;

	// Get key and value from value
	let key = value[0];
	let val = value[1];

	// Update value when key or value changes
	$: value = [key, val];
</script>

<div class="flex flex-row items-center align-items justify-center">
	<div class="lg:pt-0 mr-5 block w-1/2">
		<InputSm
			id={i.toString() + '-k'}
			label={kvFunc(i, true)}
			{placeholder}
			bind:value={key}
			{minlength}
			{showErrors}
			{required}
			{disabled}
		/>
	</div>
	<div class="lg:pt-0 block w-1/2">
		<InputSm
			id={i.toString() + '-v'}
			label={kvFunc(i, false)}
			{placeholder}
			bind:value={val}
			{minlength}
			{showErrors}
			{required}
			{disabled}
		/>
	</div>
</div>
