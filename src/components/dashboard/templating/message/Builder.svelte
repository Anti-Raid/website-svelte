<script lang="ts">
	import { parseString } from '../common';
	import { Embed as EmbedT, Message } from './types';
	import Label from '../../../inputs/Label.svelte';
	import Spacer from '../../../inputs/Spacer.svelte';
	import InputTextArea from '../../../inputs/InputTextArea.svelte';
	import Embed from './Embed.svelte';
	import logger from '$lib/ui/logger';
	import BoxButton from '../../../inputs/button/BoxButton.svelte';

	export let output: string;

	let templateBuilderData: Message;

	const validate = () => {
		if (!templateBuilderData) {
			templateBuilderData = { content: '', embeds: [] };
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
			templateStr += `\nmessage.embeds = {}\nsetmetatable(embeds, interop.array_metatable)\n\n`;
			for (let embed of tbd.embeds) {
				let fragment = generateTemplateFragmentForEmbed(embed);

				if (fragment) {
					templateStr += `${fragment}table.insert(message.embeds, embed)\n`;
				}
			}
		}

		if (tbd?.content) {
			templateStr += `\nmessage.content = ${parseString(tbd.content)}\n`;
		}

		if (templateStr) {
			templateStr = `
local args, token = ...
local actions_plugin = require "@antiraid/discord"
local interop = require "@antiraid/interop"

local message = {}

${templateStr.trim()}

-- Send message using action executor
local actions_executor = actions_plugin.new(token);
actions_executor:create_message({
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
			baseFragment += `embed.title = ${parseString(embed.title)}\n`;
		}

		if (embed.description) {
			baseFragment += `embed.description = ${parseString(embed.description)}\n`;
		}

		if (embed.fields.length > 0) {
			embed.fields.forEach((field, i) => {
				if (field.name == '' || field.value == '') {
					return;
				}

				baseFragment += `
-- Field ${i + 1}
local field = {
    name = ${parseString(field.name)},
    value = ${parseString(field.value)},
    inline = ${field.inline}
}

table.insert(embed.fields, field)
            `;
			});
		}

		if (baseFragment) {
			return `local embed = {}\n${baseFragment}`;
		}

		return baseFragment;
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
				<BoxButton onClick={() => addEmbed(i)}>New Embed</BoxButton>
				<BoxButton onClick={() => deleteEmbed(i)}>Delete Embed</BoxButton>
			</div>
		</details>
	{/each}
</div>

{#if templateBuilderData?.embeds?.length == 0}
	<BoxButton onClick={() => addEmbed(-1)}>New Embed</BoxButton>
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
