import { Embed, TemplateBuilderData, TemplateBuilderDataComment } from "./types";

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
    let templateStr = '';

    if (tbd.embeds.length > 0) {
        let embeds: string[] = []
        tbd.embeds.forEach((embed, i) => {
            let fragment = generateTemplateFragmentForEmbed(embed);

            if (fragment) embeds.push(fragment);
        });

        templateStr += embeds.join(`\n{{ new_embed() }}\n\n`)
    }

    if (tbd.content) {
        templateStr += `{% filter content %}\n${tbd.content}\n{% endfilter %}`;
    }

    if (templateStr) {
        // Get sha256 checksum of the template
        const checksum = await sha256(templateStr.trim());

        let data: TemplateBuilderDataComment = {
            data: tbd,
            checksum
        }

        templateStr += `\n\n{# BUILDER: ${JSON.stringify(data)} #}`;
    }

    return templateStr;
}

export interface ParsedTemplateBuilderComment {
    comment: TemplateBuilderDataComment;
    checksumOk: boolean;
    template: string;
}

export const parseTemplateBuilderDataCommentFromTemplate = async (template: string): Promise<ParsedTemplateBuilderComment | null> => {
    const regex = /{# BUILDER: (.*) #}/;
    const match = template.match(regex);

    if (match) {
        let comment: TemplateBuilderDataComment = JSON.parse(match[1]);
        let newTemplate = template.replace(regex, '').trim();

        // Check if the checksum is correct
        let checksumOk = await sha256(newTemplate) == comment.checksum;

        return {
            comment,
            checksumOk,
            template: newTemplate
        }
    }

    return null;
}

export const generateTemplateFragmentForEmbed = (embed: Embed) => {
    let baseFragment = '';

    if (embed.title) {
        baseFragment += `{{ embed_title(title=${parseString(embed.title)}) }}\n\n`;
    }

    if (embed.description) {
        baseFragment += `{% filter embed_description %}\n${embed.description}\n{% endfilter %}\n\n`;
    }

    if (embed.fields.length > 0) {
        embed.fields.forEach((field, _) => {
            if (field.name == "" || field.value == "") {
                return
            }
            baseFragment += `{{ embed_field(name=${parseString(field.name)}, value=${parseString(
                field.value
            )}, inline=${field.inline}) }}\n`;
        });
    }

    return baseFragment;
};
