import support from '$lib/configs/data/support.json';
import { makeSharedRequest, opGetApiConfig } from '$lib/fetch/ext';

export const loginUser = async () => {
	let state = btoa(window.location.toString());

	let config = await makeSharedRequest(opGetApiConfig);

	window.location.href = support.invite.no_bot
		.replace('{permissions}', support.invite.permissions)
		.replace('{client_id}', config.client_id)
		.replace('{redirect_url}', `${window.location.origin}/authorize`)
		.replace('{state}', state);
};
