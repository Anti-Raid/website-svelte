<script lang="ts">
	import { goto } from '$app/navigation';
	import { getAuthCreds } from '$lib/auth/getAuthCreds';
	import { get } from '$lib/configs/functions/services';
	import {
		makeSharedRequest,
		opGetModules,
		opGetAllCommandConfigurations,
		opGetModuleConfiguration
	} from '$lib/fetch/ext';
	import { fetchClient } from '$lib/fetch/fetch';
	import { UserGuildBaseData } from '$lib/generated/types';
	import {
		extractKnownPermissionsFromModules,
		makeKittycatPermissionMapperFromPermissions
	} from '$lib/ui/permMap';
	import { CommonPermissionContext } from '../../../components/dashboard/permissions/commonPermissionContext';
	import Message from '../../../components/Message.svelte';
	import Guild from './core/Guild.svelte';
	import { defaultState, stringToOpenedEntity } from './core/types';

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

		currentState = 'Fetching module list...';

		let modules = await makeSharedRequest(opGetModules());

		currentState = 'Fetching current module configuration';

		let currentModuleConfiguration = await makeSharedRequest(opGetModuleConfiguration(guildId));

		currentState = 'Fetching current command configuration';

		let currentCommandConfiguration = await makeSharedRequest(
			opGetAllCommandConfigurations(guildId)
		);

		let commonPermissionContext: CommonPermissionContext;

		try {
			commonPermissionContext = {
				kittycatPermissionMapper: makeKittycatPermissionMapperFromPermissions(
					extractKnownPermissionsFromModules(Object.values(modules))
				)
			};
		} catch (err) {
			throw new Error(`Failed to create permission context: ${err}`);
		}

		currentState = 'Taking you into the future...';

		// Check for state
		let state = defaultState();

		let openedEntityStr = searchParams.get('in');
		if (openedEntityStr) {
			state.openedEntity = stringToOpenedEntity(openedEntityStr);
		}

		return {
			guildId,
			currentModuleConfiguration,
			currentCommandConfiguration,
			guildData,
			modules,
			state,
			commonPermissionContext
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
		<Guild
			guildId={r.guildId}
			currentModuleConfiguration={r.currentModuleConfiguration}
			currentCommandConfiguration={r.currentCommandConfiguration}
			guildData={r.guildData}
			modules={r.modules}
			commonPermissionContext={r.commonPermissionContext}
			state={r.state}
		/>
	{:else}
		<div class="p-4">
			<Message type="loading">Please wait</Message>
		</div>
	{/if}
{:catch err}
	<div class="p-4">
		<Message type="error"><strong>Error</strong>{@html err?.message || err}</Message>
	</div>
{/await}
