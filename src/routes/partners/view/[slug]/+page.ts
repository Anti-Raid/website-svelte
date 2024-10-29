import { load as loadLayoutData } from '../../+page';

/** @type {import('./$types').PageLoad} */
export async function load({ params }) {
	const data = await loadLayoutData();
	const partner = data.partners.find((p) => p.name === params.slug.replaceAll('%20', ' '));

	return {
		partner: partner
	};
}
