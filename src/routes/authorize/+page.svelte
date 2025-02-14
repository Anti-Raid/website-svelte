<script lang="ts">
	import { getUser } from '$lib/auth/getUser';
	import { get } from '$lib/configs/functions/services';
	import { fetchClient } from '$lib/fetch/fetch';
	import { AuthorizeRequest, CreateUserSessionResponse } from '$lib/generated/types';
	import logger from '$lib/ui/logger';
	import Message from '@components/Message.svelte';

	const createSession = async () => {
		let searchParams = new URLSearchParams(window.location.search);

		if (!searchParams.has('code')) {
			throw new Error('No code in URL');
		}

		let guildId = searchParams.get('guild_id'); // Given if user has invited bot using full auth flow

		let json: AuthorizeRequest = {
			protocol: 'a1',
			scope: 'normal',
			code: searchParams.get('code') || '',
			redirect_uri: `${window.location.origin}/authorize`
		};
		let res = await fetchClient(`${get('splashtail')}/oauth2`, {
			method: 'POST',
			body: JSON.stringify(json)
		});

		if (!res.ok) {
			let err = await res.error('Create session', 'markdown');
			throw new Error(err);
		}

		let data: CreateUserSessionResponse = await res.json();

		// Fetch authUser from api
		let user = await getUser(data.user_id);

		if (!user) {
			throw new Error('Failed to fetch user');
		}

		localStorage.setItem('wistala', JSON.stringify(data));
		localStorage.setItem('authUser', JSON.stringify(user));

		setTimeout(() => {
			if (guildId) {
				window.location.href = `/dashboard/guilds?id=${guildId}`;
			} else {
				if (searchParams?.get('state')) {
					try {
						let path = atob(searchParams?.get('state') || '');

						window.location.href = path;
						return;
					} catch (e) {
						logger.error('Failed to redirect to state path', e);
					}
				}

				window.location.href = '/dashboard';
			}
		}, 1000);

		return data;
	};
</script>

{#await createSession()}
	<Message type="loading" big={true}>Authorizing...</Message>
{:then}
	<Message type="success" big={true}>Authorized!</Message>
{:catch error}
	<Message type="error" big={true}>
		{@html error}
	</Message>
{/await}
