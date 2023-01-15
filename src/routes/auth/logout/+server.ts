import { error, redirect } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function GET({ request, cookies, url }) {
	cookies.delete('token');
	throw redirect(307, '/');
}
