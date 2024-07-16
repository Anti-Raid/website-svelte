<script lang="ts">
	import InputTextArea from '../../inputs/InputTextArea.svelte';
	import Label from '../../inputs/Label.svelte';
	import ButtonReact from '../../inputs/multi/Button.svelte';
	import DangerButton from '../../inputs/multi/DangerButton.svelte';
	import Spacer from '../../inputs/Spacer.svelte';
	import TemplateBuilderEmbed from './TemplateBuilderEmbed.svelte';
	import { Embed, TemplateBuilderData } from './types';

	export let templateBuilderData: TemplateBuilderData;

	const deleteEmbed = (i: number) => {
		templateBuilderData.embeds = templateBuilderData.embeds.filter((_, index) => index !== i);
	};

	const addEmbed = (i: number) => {
		templateBuilderData.embeds = [
			...templateBuilderData.embeds.slice(0, i + 1),
			{ title: '', description: '', fields: [] },
			...templateBuilderData.embeds.slice(i + 1)
		];
	};
</script>

<Label id="embeds-list" label="Embeds" />
<div id="embeds-list">
	{#each templateBuilderData.embeds as embed, i}
		<details
			id={`embed-${i}--details`}
			class="embed---details border p-2 bg-black hover:bg-slate-900"
			open={true}
		>
			<summary
				class="embed--summary hover:cursor-pointer font-semibold text-xl items-center align-middle justify-center"
			>
				{embed.title ? `Embed ${i}: ${embed.title}` : `Embed ${i}`}
			</summary>

			<TemplateBuilderEmbed bind:embed />

			<div>
				<DangerButton onclick={() => deleteEmbed(i)}>Delete Embed</DangerButton>
				<ButtonReact onclick={() => addEmbed(i)}>Add Embed</ButtonReact>
			</div>
		</details>
	{/each}
</div>

{#if templateBuilderData.embeds.length == 0}
	<ButtonReact onclick={() => addEmbed(-1)}>New Embed</ButtonReact>
{/if}

<Spacer typ="smallSpacing" />

<InputTextArea
	id="templatebuilder-content"
	label="Content"
	placeholder="Message content"
	bind:value={templateBuilderData.content}
	minlength={0}
	showErrors={false}
/>
