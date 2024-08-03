import { builderVersion, Embed, TemplateBuilderData, TemplateBuilderDataComment } from "./types";

type Snippet = (current: string) => string;

export const defaultSnippets: Record<string, Snippet> = {
    "Lua Example": function (_current: string): string {
        return String.raw`@pragma {"lang":"lua"}
function (args) 
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

    return message
end`
    }
}

export const parseString = (s: string): string => {
    return `"${s}"`;
}

const sha256 = async (message: string) => {
    // encode as UTF-8
    const msgBuffer = new TextEncoder().encode(message);

    // hash the message
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

    // convert ArrayBuffer to Array
    const hashArray = Array.from(new Uint8Array(hashBuffer));

    // convert bytes to hex string                  
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

export const generateTemplateForTemplateBuilderData = async (tbd: TemplateBuilderData) => {
    let templateStr = ``;

    if (tbd.embeds.length > 0) {
        for (let embed of tbd.embeds) {
            let fragment = generateTemplateFragmentForEmbed(embed);

            if (fragment) {
                templateStr += `${fragment}table.insert(message, embed)\n\t`;
            }
        }
    }

    if (tbd.content) {
        templateStr += `message.content = ${parseString(tbd.content)}\n\t`;
    }

    if (templateStr) {
        templateStr = `function (args) {
    local message_plugin = require "@antiraid/message"
    local message = message_plugin.new_message()
    -- Create the message
    ${templateStr.trim()}
}`

        // Get sha256 checksum of the template
        const checksum = await sha256(templateStr.trim());

        let pragma: TemplatePragma = {
            lang: "lua",
            builderInfo: {
                ver: builderVersion,
                data: tbd,
                checksum
            }
        }

        templateStr = `@pragma ${JSON.stringify(pragma)}\n${templateStr}`;
    }

    return templateStr;
}

export interface ParsedTemplateBuilderComment {
    comment: TemplateBuilderDataComment;
    checksumOk: boolean;
    template: string;
}

export interface TemplatePragma {
    lang: string,
    builderInfo?: TemplateBuilderDataComment // Website specific field 
}

export const parseTemplateBuilderDataCommentFromTemplate = async (template: string): Promise<ParsedTemplateBuilderComment | null> => {
    let templateFirstLine = template.split('\n')[0];
    template = template.slice(1); // Rest of template is the actual template

    if (!templateFirstLine.startsWith("@pragma ")) {
        return null;
    }

    let pragma = templateFirstLine.substring(8).trim();

    try {
        let pragmaObj: TemplatePragma = JSON.parse(pragma);

        if (!pragmaObj.builderInfo) {
            return null;
        }

        // Check if the checksum is correct
        let checksumOk = await sha256(template) == pragmaObj.builderInfo.checksum;

        return {
            comment: pragmaObj.builderInfo,
            checksumOk,
            template
        }
    } catch {
        return null;
    }
}

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
            if (field.name == "" || field.value == "") {
                return
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
        return `local embed = message_plugin.new_message_embed()\n\t${baseFragment}`
    }

    return '';
};
