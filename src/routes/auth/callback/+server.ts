import { error, redirect } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function GET({ request, setHeaders, url }) {
	const token = url.searchParams.get('token') || null;

	if (!token) throw error(400, 'No authentication token was passed with this request.');

	setHeaders({
		'Set-Cookie': `token=${token}; Path=/; Secure;`
	});

	throw redirect(307, '/');
}
