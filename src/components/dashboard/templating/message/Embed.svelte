<script lang="ts">
	import InputText from '../../../inputs/InputText.svelte';
	import InputTextArea from '../../../inputs/InputTextArea.svelte';
	import EmbedField from './EmbedField.svelte';
	import { Embed } from './types';

	export let embed: Embed;
</script>

<div class="embed-container">
	<InputText
		id="title"
		label="Title"
		bind:value={embed.title}
		placeholder="Embed Title (optional)"
		required={false}
		disabled={false}
		minlength={0}
	/>

	<InputTextArea
		id="description"
		label="Description"
		bind:value={embed.description}
		placeholder="Embed description (optional)"
		required={false}
		disabled={false}
		minlength={0}
	/>

	<EmbedField
		id={'embed-fields'}
		placeholder="Enter something here!"
		minlength={0}
		showErrors={false}
		bind:values={embed.fields}
	/>
</div>
