<script lang="ts">
	import { goto } from '$app/navigation';
	import { getAuthCreds } from '$lib/auth/getAuthCreds';
	import { get } from '$lib/configs/functions/services';
	import {
		makeSharedRequest,
		opGetClusterHealth,
		opGetClusterModules,
		opGetModuleConfiguration
	} from '$lib/fetch/ext';
	import { fetchClient } from '$lib/fetch/fetch';
	import { ApiError, UserGuildBaseData } from '$lib/generated/types';
	import { getClusterOfShard, getShardIDFromGuildID } from '$lib/mewext/mewext';
	import { formatApiError } from '$lib/ui/error';
	import Message from '../../../components/Message.svelte';
	import Guild from './Guild.svelte';

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

		let res = await fetchClient(
			`${get('splashtail')}/users/${authCreds?.user_id}/guilds/${guildId}`,
			{
				auth: authCreds?.token,
				onRatelimit: (n, err) => {
					if (!n) {
						currentState = 'Retrying fetching of guild data';
					} else {
						currentState = `${err?.message} [retrying again in ${n / 1000} seconds]`;
					}
				}
			}
		);

		if (!res.ok) {
			let err: ApiError = await res.json();
			throw new Error(formatApiError('Failed to fetch base guild data', err));
		}

		let guildData: UserGuildBaseData = await res.json();

		currentState = 'Fetching cluster health and metadata';

		let instanceList = await makeSharedRequest(opGetClusterHealth);

		currentState = 'Fetching cluster modules for guild';

		let [guildShardId, err] = getShardIDFromGuildID(guildId, instanceList.Instances.length);

		if (err) {
			throw err;
		}

		let guildClusterId = getClusterOfShard(guildShardId, instanceList.Map);

		let clusterModules = await makeSharedRequest(opGetClusterModules(guildClusterId));

		currentState = 'Fetching current module configuration';

		let currentModuleConfiguration = await makeSharedRequest(opGetModuleConfiguration(guildId));

		return {
			guildId,
			currentModuleConfiguration,
			guildData,
			instanceList,
			guildShardId,
			guildClusterId,
			clusterModules
		};
	};
</script>

{#await loadGuildData()}
	<Message type="loading">Loading dashboard</Message>
	<small>
		<span class="font-semibold">Current State: </span>
		{currentState}
	</small>
{:then r}
	{#if r}
		<Guild
			guildId={r.guildId}
			currentModuleConfiguration={r.currentModuleConfiguration}
			guildData={r.guildData}
			instanceList={r.instanceList}
			guildShardId={r.guildShardId}
			guildClusterId={r.guildClusterId}
			clusterModules={r.clusterModules}
		/>
	{:else}
		<Message type="loading">Please wait</Message>
	{/if}
{:catch err}
	<Message type="error">Error loading dashboard data: {err}</Message>
{/await}
