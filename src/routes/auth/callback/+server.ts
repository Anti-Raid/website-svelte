import { error, redirect } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function GET({ request, cookies, url }) {
	const token = url.searchParams.get('token') || null;
	const discordToken = url.searchParams.get('discord') || null;

	if (!token) throw error(400, 'No authentication token was passed with this request.');
	if (!discordToken) throw error(400, 'No Discord token was passed with this request.');

	cookies.set('token', token, {
		path: '/',
		secure: true
	});

	cookies.set('discord', discordToken, {
		path: '/',
		secure: true
	});

	throw redirect(307, '/');
}
