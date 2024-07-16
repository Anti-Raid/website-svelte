import { Embed, TemplateBuilderData } from "./types";

export const parseString = (s: string): string => {
    // If it starts with $expr:, then it's a raw string
    if (s.startsWith("$expr")) {
        return s.substring(5).trim();
    }

    return `"${s}"`;
}

export const generateTemplateForTemplateBuilderData = (tbd: TemplateBuilderData) => {
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

    return templateStr;
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
