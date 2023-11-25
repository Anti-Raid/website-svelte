import cookie from 'cookie';

export const load = async ({ request, fetch, params }) => {
    const cookies = cookie.parse(request.headers.get('cookie') || '');

    let channels = null;
    if (cookies.discord) {
        channels = await fetch(`https://discord.com/api/v10/guilds/${params.slug}/channels`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": cookies.discord
            }
        }).then((res) => res.json());
    }

	return {
		slug: params.slug,
        channels: channels
	};
}
