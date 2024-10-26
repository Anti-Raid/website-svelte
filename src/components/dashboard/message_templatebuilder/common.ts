import { builderVersion, Embed, TemplateBuilderData, TemplateBuilderDataComment } from './types';

type Snippet = (current: string) => string;

export const defaultSnippets: Record<string, Snippet> = {
	'Lua Example': function (_current: string): string {
		return String.raw`-- @pragma {"lang":"lua"}
local args, token = ...
local message_plugin = require "@antiraid/message"

-- Make the embed
local embed = message_plugin.new_message_embed()
embed.title = args.event_titlename
embed.description = "" -- Start with an empty description

-- Add the fields to the description
for key, value in pairs(args.fields) do
	local should_set = false

	if value ~= nil and value.field.type ~= "None" then
		should_set = true
	end

	if should_set then
		local formatted_value = message_plugin.format_gwevent_categorized_field(value)
		embed.description = embed.description .. "**" .. key:gsub("_", " "):upper() .. "**: " .. formatted_value .. "\n"
	end
end

local message = message_plugin.new_message()

table.insert(message.embeds, embed)

return message`;
	}
};

export const parseString = (s: string): string => {
	// First escape all single and double quotes
	s = s.replaceAll(`"`, `\\"`).replaceAll(`'`, `\\'`);

	s = `"${s}"`;

	// Builder variables are in format {var}, in such cases, we need to escape the quotes and use ~ to concat them
	// Note that the {var} must have both { and } to be considered a variable and we must escape the quotes
	let match = s.match(/[^{\}]+(?=})/g);
	if (match) {
		for (let m of match) {
			m = `{${m}}`; // We want the brackets for now
			// We need to escape the quotes and then use ~ to concat them
			let escaped = m.replaceAll('{', '').replaceAll('}', '').trim();

			if (!escaped) {
				continue; // {} should not be considered as a variable
			}

			s = s.replace(m, `" .. tostring(${escaped}) .. "`);
		}
	}

	// If the string ends with "", remove it
	if (s.includes(` .. \"\"`)) {
		s = s.replaceAll(' .. ""', '');
	}

	// If the string starts with "", remove it
	if (s.includes(`\"\" .. `)) {
		s = s.replaceAll('"" .. ', '');
	}

	// Convert enters to the \n string
	s = s.replaceAll('\n', '\\n');

	return s;
};

const sha256 = async (message: string) => {
	// encode as UTF-8
	const msgBuffer = new TextEncoder().encode(message);

	// hash the message
	const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

	// convert ArrayBuffer to Array
	const hashArray = Array.from(new Uint8Array(hashBuffer));

	// convert bytes to hex string
	const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
	return hashHex;
};

export const generateTemplateForTemplateBuilderData = async (tbd: TemplateBuilderData) => {
	let templateStr = ``;

	if (tbd.embeds.length > 0) {
		for (let embed of tbd.embeds) {
			let fragment = generateTemplateFragmentForEmbed(embed);

			if (fragment) {
				templateStr += `${fragment}table.insert(message.embeds, embed)\n\t`;
			}
		}
	}

	if (tbd.content) {
		templateStr += `message.content = ${parseString(tbd.content)}\n\t`;
	}

	if (templateStr) {
		templateStr = `
local args, token = ...
local message_plugin = require "@antiraid/message"
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

		// Get sha256 checksum of the template
		const checksum = await sha256(templateStr.trim());

		let pragma: TemplatePragma = {
			lang: 'lua',
			builderInfo: {
				ver: builderVersion,
				data: tbd,
				checksum
			}
		};

		templateStr = `@pragma ${JSON.stringify(pragma)}\n${templateStr}`;
	}

	return templateStr;
};

export interface ParsedTemplateBuilderComment {
	comment: TemplateBuilderDataComment;
	checksumOk: boolean;
	template: string;
}

export interface TemplatePragma {
	lang: string;
	builderInfo?: TemplateBuilderDataComment; // Website specific field
}

export const parseTemplateBuilderDataCommentFromTemplate = async (
	template: string
): Promise<ParsedTemplateBuilderComment | null> => {
	let templateFirstLine = template.split('\n')[0];

	if (!templateFirstLine.startsWith('@pragma ')) {
		return null;
	}

	let pragma = templateFirstLine.substring(8).trim();

	try {
		let pragmaObj: TemplatePragma = JSON.parse(pragma);

		if (!pragmaObj.builderInfo) {
			return null;
		}

		// Check if the checksum is correct
		let checksumOk =
			(await sha256(template.split('\n').slice(1).join('\n'))) == pragmaObj.builderInfo.checksum;

		return {
			comment: pragmaObj.builderInfo,
			checksumOk,
			template
		};
	} catch {
		return null;
	}
};

export const generateTemplateFragmentForEmbed = (embed: Embed) => {
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
