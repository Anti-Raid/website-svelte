<script lang="ts">
	import { onMount } from 'svelte';
	import { parseString } from '../common';
	import { Embed as EmbedT, Message } from './types';
	import Label from '../../../inputs/Label.svelte';
	import DangerButton from '../../../inputs/multi/DangerButton.svelte';
	import ButtonReact from '../../../inputs/multi/Button.svelte';
	import Spacer from '../../../inputs/Spacer.svelte';
	import InputTextArea from '../../../inputs/InputTextArea.svelte';
	import Embed from './Embed.svelte';
	import logger from '$lib/ui/logger';

	// This will be passed by the parent component
	export let templateBuilderData: Message;
	// svelte-ignore unused-export-let
	export let output: string;
	// svelte-ignore unused-export-let
	export let neededCaps: string[];

	const validate = () => {
		if (!templateBuilderData) {
			templateBuilderData = { content: '', embeds: [] };
		}

		if (!neededCaps || !neededCaps.includes('discord:sendmessage_channel')) {
			neededCaps = ['discord:sendmessage_channel'];
		}

		if (!templateBuilderData.embeds || !Array.isArray(templateBuilderData.embeds)) {
			templateBuilderData.embeds = [];
		}

		if (!templateBuilderData.content || typeof templateBuilderData.content !== 'string') {
			templateBuilderData.content = '';
		}
	};

	const deleteEmbed = (i: number) => {
		validate();
		templateBuilderData.embeds = templateBuilderData.embeds.filter((_, index) => index !== i);
	};

	const addEmbed = (i: number) => {
		validate();
		templateBuilderData.embeds = [
			...templateBuilderData.embeds.slice(0, i + 1),
			{ title: '', description: '', fields: [] },
			...templateBuilderData.embeds.slice(i + 1)
		];
	};

	export const generateTemplateForTemplateBuilderData = (tbd: Message) => {
		validate();

		logger.info('TemplateBuilder#Message.generateTemplateForTemplateBuilderData', 'tbd', tbd);

		let templateStr = ``;

		if (tbd?.embeds?.length > 0) {
			for (let embed of tbd.embeds) {
				let fragment = generateTemplateFragmentForEmbed(embed);

				if (fragment) {
					templateStr += `${fragment}table.insert(message.embeds, embed)\n\t`;
				}
			}
		}

		if (tbd?.content) {
			templateStr += `message.content = ${parseString(tbd.content)}\n\t`;
		}

		if (templateStr) {
			templateStr = `
local args, token = ...
local message_plugin = require "@antiraid/message"
local actions_plugin = require "@antiraid/discord"
local message = message_plugin.new_message()
-- Create the message
${templateStr.trim()}

-- Send message using action executor
local actions_executor = actions_plugin.new(token);
actions_executor:sendmessage_channel({
    channel_id = args.sink,
    message = message
})
`;
		}

		return templateStr;
	};

	export const generateTemplateFragmentForEmbed = (embed: EmbedT) => {
		let baseFragment = '';

		if (embed.title) {
			baseFragment += `embed.title = ${parseString(embed.title)}\n\t`;
		}

		if (embed.description) {
			baseFragment += `embed.description = ${parseString(embed.description)}\n\t`;
		}

		if (embed.fields.length > 0) {
			embed.fields.forEach((field, i) => {
				if (field.name == '' || field.value == '') {
					return;
				}

				baseFragment += `
-- Field ${i + 1}
local field = message_plugin.new_message_embed_field()\n
field.name = ${parseString(field.name)}\n
field.value = ${parseString(field.value)}\n
field.inline = ${field.inline}\n
table.insert(embed.fields, field)\n
            `;
			});
		}

		if (baseFragment) {
			return `local embed = message_plugin.new_message_embed()\n\t${baseFragment}`;
		}

		return '';
	};

	$: {
		output = generateTemplateForTemplateBuilderData(templateBuilderData);
		logger.info('Output updated', { output });
	}
</script>

<Label id="embeds-list" label="Embeds" />
<div id="embeds-list">
	{#each templateBuilderData?.embeds || [] as embed, i}
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

			<Embed bind:embed />

			<div>
				<DangerButton onclick={() => deleteEmbed(i)}>Delete Embed</DangerButton>
				<ButtonReact onclick={() => addEmbed(i)}>Add Embed</ButtonReact>
			</div>
		</details>
	{/each}
</div>

{#if templateBuilderData?.embeds?.length == 0}
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
