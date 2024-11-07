<script lang="ts">
	import Message from '@components/Message.svelte';
	import support from '$lib/configs/data/support.json';
	import { makeSharedRequest, opGetApiConfig } from '$lib/fetch/ext';

	const getInvite = async () => {
		let searchParams = new URLSearchParams(window.location.search);

		let basic = searchParams.get('basic');

		let urlBase = basic ? support.invite.basic : support.invite.full;
		if (searchParams.get('guild_id')) {
			urlBase = `${urlBase}&guild_id=${searchParams.get('guild_id')}`;
		}

		let config = await makeSharedRequest(opGetApiConfig);

		urlBase = urlBase
			.replace('{permissions}', support.invite.permissions)
			.replace('{client_id}', config.client_id)
			.replace('{redirect_url}', `${window.location.origin}/authorize`);

		window.location.href = urlBase;
		return urlBase;
	};
</script>

{#await getInvite()}
	<Message type="loading" big={true}>Fetching you an *exclusive* invite!</Message>
{:then invite}
	<Message type="success" big={true}>Please wait while we <a href={invite}>redirect you</a></Message
	>
{:catch error}
	<Message type="error" big={true}>
		{@html error}
	</Message>
{/await}
