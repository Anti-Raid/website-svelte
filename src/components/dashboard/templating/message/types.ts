export interface Message {
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
