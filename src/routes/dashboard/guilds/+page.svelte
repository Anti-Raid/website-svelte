<script lang="ts">
	import { goto } from '$app/navigation';
	import { getAuthCreds } from '$lib/auth/getAuthCreds';
	import { get } from '$lib/configs/functions/services';
	import { makeSharedRequest, opGetBotState } from '$lib/fetch/ext';
	import { fetchClient } from '$lib/fetch/fetch';
	import { UserGuildBaseData } from '$lib/generated/types';
	import CommandList from '@components/common/CommandList.svelte';
	import Spacer from '@components/inputs/Spacer.svelte';
	import Message from '@components/Message.svelte';
	import Setting from '@components/settings/Setting.svelte';

	let currentState = 'Loading dashboard data';

	const loadGuildData = async () => {
		let authCreds = getAuthCreds();

		if (!authCreds) throw new Error('No auth credentials found');

		let searchParams = new URLSearchParams(window.location.search);

		let guildId = searchParams.get('id');

		if (!guildId) {
			await goto('/dashboard');
			return null;
		}

		currentState = 'Fetching guild data';

		let res = await fetchClient(`${get('splashtail')}/users/@me/guilds/${guildId}`, {
			auth: authCreds?.token,
			onRatelimit: (n, err) => {
				if (!n) {
					currentState = 'Retrying fetching of guild data';
				} else {
					currentState = `${err?.message} [retrying again in ${n / 1000} seconds]`;
				}
			}
		});

		if (!res.ok) {
			let err = await res.error('Base Guild Data');
			throw new Error(err);
		}

		let guildData: UserGuildBaseData = await res.json();

		currentState = 'Fetching bot state...';

		let botState = await makeSharedRequest(opGetBotState());

		currentState = 'Taking you into the future...';

		return {
			guildId,
			guildData,
			botState
		};
	};
</script>

{#await loadGuildData()}
	<div class="p-4">
		<Message type="loading">Loading dashboard</Message>
		<small>
			<span class="font-semibold">Current State: </span>
			{currentState}
		</small>
	</div>
{:then r}
	{#if r}
		<!--Content-->
		<section class="content col-span-1 md:col-span-4">
			<section class="guild-basic-details ml-2 px-2 mb-auto mx-auto">
				<!--Avatar-->
				<img
					loading="lazy"
					src={r.guildData.icon}
					class="h-8 m-0 align-middle inline rounded-full"
					alt="{r.guildData.name}'s avatar"
				/>
				<!--Guild Name-->
				<span class="ml-1 font-monster font-bold tracking-tight align-middle m-0"
					>{r.guildData.name}</span
				>
			</section>

			<div class="index-page ml-2 px-2 mb-auto mx-auto">
				<h1 class="text-2xl font-semibold">Welcome!</h1>
				<p class="text-slate-200">
					Using the dashboard, you can control almost all aspects of AntiRaid and its operation on
					your server!
				</p>

				<p class="text-slate-200">
					<span class="font-monster text-lg">
						Want something beyond the core commands. Check out
						<a
							class="text-primary-300 hover:text-primary-500"
							href="https://docs.antiraid.xyz/user/templating/1-intro"
							target="_blank">Templating</a
						>, the official way to extend AntiRaid to meet your needs!
					</span>
				</p>

				<div class="mb-2" />

				{#each r.botState.settings as configOpt}
					<Setting {configOpt} guildId={r.guildId} guildData={r.guildData} />
					<Spacer typ="smallSpacing" />
				{/each}

				<h2 class="text-4xl font-bold tracking-tight text-gray-900">
					<span class="block text-white xl:inline">Command List</span>
				</h2>

				<CommandList />
			</div>
		</section>
	{:else}
		<div class="p-4">
			<Message type="loading">Please wait...</Message>
		</div>
	{/if}
{:catch err}
	<div class="p-4">
		<Message type="error"><strong>Error</strong>{@html err?.message || err}</Message>
	</div>
{/await}
