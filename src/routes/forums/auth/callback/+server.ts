import { error, redirect } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function GET({ request, cookies, url }) {
	const token = url.searchParams.get('token') || null;
	if (!token) throw error(400, 'No authentication token was passed with this request.');

	cookies.set('token', token, {
		path: '/',
		secure: true,
		expires: ((d) => new Date(d.getFullYear() + 1, d.getMonth(), d.getDate()))(new Date())
	});

	throw redirect(307, '/');
}
