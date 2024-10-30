import { load as loadLayoutData } from '../+page';

export async function GET({ request }: any) {
	const data = await loadLayoutData();

	return new Response(JSON.stringify(data).trim(), {
		headers: {
			'Content-Type': 'application/json'
		}
	});
}
