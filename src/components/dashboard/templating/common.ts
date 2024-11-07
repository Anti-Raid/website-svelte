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
