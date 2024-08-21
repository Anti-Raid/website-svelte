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
	import Label from '../inputs/Label.svelte';
	import Message from '../Message.svelte';
	import SettingSchema from './SettingSchema.svelte';
	import { settingsFetchQueue } from './types';

	export let clusterModules: Record<string, CanonicalModule>;
	export let configOpt: CanonicalConfigOption;
	export let module: CanonicalModule;
	export let guildData: UserGuildBaseData;
	export let guildId: string;
	export let filters: Record<string, any> = {}; // Any filters to apply

	const getCurrentSettings = async () => {
		let payload: SettingsExecute = {
			operation: 'View',
			module: module.id,
			setting: configOpt.id,
			fields: filters
		};

		const settings = await settingsFetchQueue.addToQueue(guildId, payload);

		return settings;
	};
</script>

<Label id={configOpt.id} label={configOpt.name} />
<p class="text-md mb-2 opacity-80">{@html configOpt.description}</p>

{#await getCurrentSettings()}
	<p>Loading...</p>
{:then settings}
	<div class="setting" id={configOpt.id}>
		<SettingSchema {configOpt} {module} {guildId} {settings} {guildData} {clusterModules} />
	</div>
{:catch err}
	<Message type="error"><strong>Error</strong>{@html err?.message || err}</Message>
{/await}
