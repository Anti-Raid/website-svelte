/**
 * In order for builder to parse its own template, it is needed to insert a comment with the data in the following format:
 */
export interface TemplateBuilderDataComment {
    data: TemplateBuilderData;
    checksum: string; // SHA256 checksum to ensure that users using advanced mode wont have older versions of the template
}

export interface TemplateBuilderData {
    embeds: Embed[];
    content: string;
}

export interface Embed {
    title: string;
    description: string;
    fields: EmbedField[];
}

export interface EmbedField {
    name: string;
    value: string;
    inline: boolean;
}

export const defaultData = () => {
    return {
        embeds: [{ title: '', description: '', fields: [] }],
        content: ''
    };
}