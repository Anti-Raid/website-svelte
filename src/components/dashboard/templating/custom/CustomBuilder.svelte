<script lang="ts">
	import InputTextArea from '../../../inputs/InputTextArea.svelte';

	// This will be passed by the parent component

	// svelte-ignore unused-export-let
	export let templateBuilderData: any;
	// svelte-ignore unused-export-let
	export let output: string;
	// svelte-ignore unused-export-let
	export let neededCaps: string[]; // We dont care about this for custom builder
</script>

<InputTextArea
	id="custom-template"
	label="Custom Template"
	bind:value={output}
	placeholder="Enter your custom template here..."
	required={true}
	disabled={false}
	minlength={0}
	showErrors={false}
/>
