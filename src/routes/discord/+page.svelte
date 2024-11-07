<script lang="ts">
	import Message from '@components/Message.svelte';
	import support from '$lib/configs/data/support.json';
	import { makeSharedRequest, opGetApiConfig } from '$lib/fetch/ext';

	const getInvite = async () => {
		let config = await makeSharedRequest(opGetApiConfig);

		window.location.href = config.support_server_invite;
		return config.support_server_invite;
	};
</script>

{#await getInvite()}
	<Message type="loading" big={true}>Fetching invite...</Message>
{:then invite}
	<Message type="success" big={true}
		>Please wait while we <a href={invite}>redirect you...</a></Message
	>
{:catch error}
	<Message type="error" big={true}>
		{@html error}
	</Message>
{/await}
