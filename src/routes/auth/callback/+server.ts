import { error, redirect } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function GET({ request, setHeaders, url }) {
    const auth = url.searchParams.get("data") || null;
    
    if (!auth) throw error(400, "No authentication token was passed with this request.");

    setHeaders({
        "Set-Cookie": `auth=${auth}; Path=/; Secure;`
    });

    throw redirect(307, "/");
}
