<script lang="ts">
	import SelectMulti from '../../../components/inputs/select/SelectMulti.svelte';

	let selectedValues: string[];
</script>

<SelectMulti
	id="test"
	label="Test"
	choices={[
		{ id: '1', value: '1', label: 'One' },
		{ id: '2', value: '2', label: 'Two' },
		{ id: '3', value: '3', label: 'Three' }
	]}
	bind:value={selectedValues}
	required={true}
	disabled={false}
	defaultLabel="Select an action"
/>
