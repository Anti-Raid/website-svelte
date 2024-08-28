export const title = (str: string) => {
	return str.replace(/(^|\s)\S/g, (t) => {
		return t.toUpperCase();
	});
};
