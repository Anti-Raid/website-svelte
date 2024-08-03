import { builderVersion, Embed, TemplateBuilderData, TemplateBuilderDataComment } from "./types";

export const parseString = (s: string): string => {
    // If it starts with $expr:, then it's a raw string
    if (s.startsWith("$expr")) {
        return s.substring(5).trim();
    }

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
    let templateStr = `
function (args) {
    local message_plugin = require "@antiraid/message"
    local message = message_plugin.new_message()
`;

    if (tbd.embeds.length > 0) {
        for (let embed of tbd.embeds) {
            let fragment = generateTemplateFragmentForEmbed(embed);

            if (fragment) {
                templateStr += `${fragment}\n\ttable.insert(message, embed)\n\t`;
            }
        }
    }

    if (tbd.content) {
        templateStr += `message.content = ${parseString(tbd.content)}\n\t`;
    }

    if (templateStr) {
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
    let baseFragment = 'local embed = message_plugin.new_message_embed()\n\t';

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

    return baseFragment;
};
