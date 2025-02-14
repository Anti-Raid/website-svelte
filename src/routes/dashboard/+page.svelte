<script lang="ts">
	import { getAuthCreds } from '$lib/auth/getAuthCreds';
	import { get } from '$lib/configs/functions/services';
	import { fetchClient } from '$lib/fetch/fetch';
	import { DashboardGuildData } from '$lib/generated/types';
	import Message from '@components/Message.svelte';
	import ServerCard from '@components/dashboard/ServerCard.svelte';
	import Column from '@components/Column.svelte';
	import InputText from '@components/inputs/InputText.svelte';
	import ButtonReact from '@components/inputs/button/ButtonReact.svelte';
	import { NoticeProps } from '@components/common/noticearea/noticearea';
	import NoticeArea from '@components/common/noticearea/NoticeArea.svelte';

	let currentState = 'Loading dashboard data';
	let guilds: DashboardGuildData;
	let canInvite: string[] = [];
	let hasBot: string[] = [];

	let hasBotSearchFilter: string = '';
	let serverListSearchFilter: string = '';

	const loadIndexDashPage = async (refresh: boolean) => {
		let authCreds = getAuthCreds();

		if (!authCreds) throw new Error('No auth credentials found');

		currentState = 'Fetching user guild list';

		let res = await fetchClient(`${get('splashtail')}/users/@me/guilds?refresh=${refresh}`, {
			auth: authCreds?.token,
			onRatelimit: (n, err) => {
				if (!n) {
					currentState = 'Retrying fetching of user guild list';
				} else {
					currentState = `Ratelimited, retrying user guild list fetch in ${n / 1000} seconds (${
						err?.message
					})`;
				}
			}
		});

		if (!res.ok) {
			throw new Error(await res.error('User Guild List', 'markdown'));
		}

		guilds = await res.json();

		if (guilds?.has_bot) {
			hasBot = guilds?.has_bot;
		}

		for (let guild of guilds?.guilds || []) {
			if (!guild) {
				continue;
			}

			// Check if the user has Manage Server permissions, otherwise they cant invite the bot
			let hasManageServer = (guild.permissions & (1 << 5)) == 1 << 5;

			if (hasManageServer) {
				canInvite.push(guild.id);
			}
		}
	};

	const recacheForce = async () => {
		await loadIndexDashPage(true);
	};

	let topNoticeArea: NoticeProps | null;
	let bottomNoticeArea: NoticeProps | null;
</script>

{#await loadIndexDashPage(false)}
	<div class="p-4">
		<Message type="loading">Loading dashboard</Message>
		<small>
			<span class="font-semibold">Current State: </span>
			{currentState}
		</small>
	</div>
{:then}
	{#if topNoticeArea}
		<NoticeArea props={topNoticeArea} />
	{/if}

	<ButtonReact
		text="Refresh Server List"
		icon="mdi:refresh"
		onClick={recacheForce}
		states={{
			loading: 'Refreshing...',
			error: 'Failed to refresh',
			success: 'Refreshed'
		}}
		bind:noticeProps={topNoticeArea}
	/>

	<h1 class="text-white font-semibold text-2xl">Servers With AntiRaid ({hasBot?.length})</h1>
	<p class="mb-2 text-red-500">
		You may or may not have permission to view or modify these servers...
	</p>

	<InputText
		id="hasBotSearchFilter"
		label="Search for a server"
		placeholder="Server Name"
		bind:value={hasBotSearchFilter}
		minlength={0}
		showErrors={false}
	/>

	<div class="my-3" />

	<Column size="small">
		{#each (guilds?.guilds || [])?.filter((g) => hasBot?.includes(g?.id || '') && (!hasBotSearchFilter || g?.name
						?.toLocaleLowerCase()
						?.includes(hasBotSearchFilter?.toLocaleLowerCase()))) as guild}
			<ServerCard
				id={guild?.id || ''}
				name={guild?.name || ''}
				image={guild?.avatar || '/logo.webp'}
				mainAction={hasBot.includes(guild?.id || '')
					? { name: 'View', href: `/dashboard/guilds?id=${guild?.id}`, icon: 'mdi:elevation-rise' }
					: { name: 'Invite', href: `/invite?guild_id=${guild?.id}`, icon: 'mdi:discord' }}
			>
				<span slot="message" class="text-green-400">
					Seems all good to go. Click {hasBot.includes(guild?.id || '')
						? 'View to get started!'
						: 'Invite and invite the bot to a server you moderate'}
				</span>
			</ServerCard>
		{/each}
	</Column>

	<div class="my-5" />

	<h1 class="text-white font-semibold text-2xl mt-5 mb-2">
		Your Server List ({guilds?.guilds?.length})
	</h1>

	<InputText
		id="serverListSearchFilter"
		label="Search for a server"
		placeholder="Server Name"
		bind:value={serverListSearchFilter}
		minlength={0}
		showErrors={false}
	/>

	<div class="my-3" />

	<Column size="small">
		{#each (guilds?.guilds || [])?.filter((g) => {
			// If no filter, show only servers the user can invite the bot to
			if (!serverListSearchFilter) {
				if (!hasBot.includes(g?.id || '') && !canInvite.includes(g?.id || '')) {
					return false;
				}

				return true;
			}

			// If filter, show servers that match the filter
			return g?.name?.toLocaleLowerCase()?.includes(serverListSearchFilter?.toLocaleLowerCase());
		}) as guild}
			<ServerCard
				id={guild?.id || ''}
				name={guild?.name || ''}
				image={guild?.avatar || '/logo.webp'}
				disabled={!hasBot.includes(guild?.id || '') && !canInvite.includes(guild?.id || '')
					? 'You do not have permission to invite the bot to this server'
					: ''}
				mainAction={hasBot.includes(guild?.id || '')
					? { name: 'View', href: `/dashboard/guilds?id=${guild?.id}`, icon: 'mdi:elevation-rise' }
					: { name: 'Invite', href: `/invite?guild_id=${guild?.id}`, icon: 'mdi:discord' }}
			>
				<span slot="message" class="text-green-400">
					Seems all good to go. Click {hasBot.includes(guild?.id || '')
						? 'View to get started!'
						: 'Invite and invite the bot to a server you moderate'}
				</span>
			</ServerCard>
		{/each}
	</Column>

	<div class="my-3" />

	<ButtonReact
		text="Refresh Server List"
		icon="mdi:refresh"
		onClick={recacheForce}
		states={{
			loading: 'Refreshing...',
			error: 'Failed to refresh',
			success: 'Refreshed'
		}}
		bind:noticeProps={bottomNoticeArea}
	/>

	{#if bottomNoticeArea}
		<NoticeArea props={bottomNoticeArea} />
	{/if}
{:catch error}
	<div class="p-4">
		<Message type="error">
			{error?.toString() || 'Failed to load dashboard'}
		</Message>
	</div>
{/await}
