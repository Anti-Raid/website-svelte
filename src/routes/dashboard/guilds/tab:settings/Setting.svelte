<script lang="ts">
	import { getAuthCreds } from '$lib/auth/getAuthCreds';
	import { get } from '$lib/configs/functions/services';
	import { fetchClient } from '$lib/fetch/fetch';
	import { CanonicalConfigOption, CanonicalModule } from '$lib/generated/silverpelt';
	import {
		SettingsExecute,
		SettingsExecuteResponse,
		UserGuildBaseData
	} from '$lib/generated/types';
	import Label from '../../../../components/inputs/Label.svelte';
	import Message from '../../../../components/Message.svelte';
	import SettingSchema from './SettingSchema.svelte';

	export let configOpt: CanonicalConfigOption;
	export let module: CanonicalModule;
	export let guildData: UserGuildBaseData;
	export let guildId: string;

	const getCurrentSettings = async () => {
		const creds = getAuthCreds();
		if (!creds) throw new Error('No auth credentials found');

		let payload: SettingsExecute = {
			operation: 'View',
			module: module.id,
			setting: configOpt.id,
			fields: {} as Record<string, any>
		};

		const res = await fetchClient(`${get('splashtail')}/guilds/${guildId}/settings`, {
			method: 'POST',
			auth: creds?.token,
			body: JSON.stringify(payload)
		});

		if (!res.ok) {
			let err = await res.error('Failed to fetch settings for this module');
			throw new Error(err);
		}

		let settings: SettingsExecuteResponse = await res.json();

		return settings;
	};
</script>

<Label id={configOpt.id} label={configOpt.name} />
<p class="text-md mb-2 opacity-80">{@html configOpt.description}</p>

{#await getCurrentSettings()}
	<p>Loading...</p>
{:then settings}
	<SettingSchema {configOpt} {module} {guildId} {settings} {guildData} />
{:catch err}
	<Message type="error"><strong>Error</strong>{@html err?.message || err}</Message>
{/await}
