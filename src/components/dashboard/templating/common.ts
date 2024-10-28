import logger from '$lib/ui/logger';

/**
 * Parses a string for Lua purposes
 * @param s The string to parse
 * @returns The parsed string
 */
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

export const parseTemplateBuilderDataCommentFromTemplate = (
	template: string
): ParsedTemplateBuilderComment => {
	let templateFirstLine = template.split('\n')[0];

	if (!templateFirstLine.startsWith('@pragma ') && !templateFirstLine.startsWith('-- @pragma ')) {
		logger.debug(
			'parseTemplateBuilderDataCommentFromTemplate',
			'No pragma found, returning default comment'
		);
		return {
			comment: {
				ver: builderVersion,
				for: '',
				data: {}
			},
			template: ''
		};
	}

	let pragma = templateFirstLine.replace('-- @pragma ', '').replace('@pragma ', '').trim();

	try {
		let pragmaObj: TemplatePragma = JSON.parse(pragma);

		if (!pragmaObj.builderInfo) {
			return {
				comment: {
					ver: builderVersion,
					for: '',
					data: {}
				},
				template
			};
		}

		return {
			comment: pragmaObj.builderInfo,
			template
		};
	} catch (err) {
		logger.error(
			'parseTemplateBuilderDataCommentFromTemplate',
			`Error parsing pragma JSON: ${err}`
		);
		return {
			comment: {
				ver: builderVersion,
				for: '',
				data: {}
			},
			template
		};
	}
};

/**
 * In order for builder to parse its own template, it is needed to insert a comment with the data in the following format:
 */

export const builderVersion = 2;

export interface TemplateBuilderDataComment {
	ver: number;
	for: string; // What script type to use
	data: any;
}

export interface TemplatePragma {
	lang: string;
	allowed_caps: string[];
	builderInfo?: TemplateBuilderDataComment; // Website specific field
}

export interface ParsedTemplateBuilderComment {
	comment: TemplateBuilderDataComment;
	template: string;
}
