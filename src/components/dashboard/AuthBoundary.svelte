<script lang="ts">
	import { checkAuthCreds } from '$lib/auth/checkAuthCreds';
	import { LSAuthData } from '$lib/auth/core';
	import { getAuthCreds } from '$lib/auth/getAuthCreds';
	import { loginUser } from '$lib/auth/loginUser';
	import { logoutUser } from '$lib/auth/logoutUser';
	import Message from '../Message.svelte';

	let currentState: string = 'Checking your credentials';

	const checkAuth = async (authCreds: LSAuthData) => {
		// Check auth
		if (!authCreds) {
			throw new Error('No auth credentials found');
		}

		try {
			return await checkAuthCreds(authCreds);
		} catch {
			return true;
		}
	};

	const checkAuthData = async () => {
		let authCreds = getAuthCreds();

		if (!authCreds) {
			currentState = 'Logging you in....';

			try {
				await loginUser();
			} catch (err) {
				throw new Error(err?.toString() || 'Failed to login');
			}

			return false;
		}

		let r = await checkAuth(authCreds);

		if (!r) {
			currentState = 'Session expired...';
			logoutUser();
			window.location.reload();
			return false;
		}

		return true;
	};
</script>

{#await checkAuthData()}
	<div class="p-4">
		<Message type="loading">Loading...</Message>
		<small>
			<span class="font-semibold">Current State: </span>
			{currentState}
		</small>
	</div>
{:then res}
	{#if res}
		<slot />
	{:else}
		<div class="p-4">
			<Message type="loading">Please wait...</Message>
		</div>
	{/if}
{:catch error}
	<div class="p-4">
		<Message type="error">
			{error?.toString() || 'Failed to load dashboard'}
		</Message>
	</div>
{/await}
