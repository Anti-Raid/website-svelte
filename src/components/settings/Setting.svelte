<script lang="ts">
	import { CanonicalConfigOption, CanonicalModule } from '$lib/generated/silverpelt';
	import { SettingsExecute, UserGuildBaseData } from '$lib/generated/types';
	import Label from '../inputs/Label.svelte';
	import Message from '../Message.svelte';
	import SettingsView from './SettingsView.svelte';
	import { settingsFetchQueue } from '$lib/ui/settings';

	export let clusterModules: Record<string, CanonicalModule>;
	export let configOpt: CanonicalConfigOption;
	export let module: CanonicalModule;
	export let guildData: UserGuildBaseData;
	export let guildId: string;
	export let filters: Record<string, any> = {}; // Any filters to apply

	let offset: number = 0;

	const getCurrentSettings = async (limit: number, offset: number) => {
		let payload: SettingsExecute = {
			operation: 'View',
			module: module.id,
			setting: configOpt.id,
			fields: {
				...filters,
				__limit: limit,
				__offset: offset
			}
		};

		const settings = await settingsFetchQueue.addToQueue(guildId, payload);

		return settings;
	};
</script>

<Label id={configOpt.id} label={configOpt.name} />
<p class="text-md mb-2 opacity-80">{@html configOpt.description}</p>

{#await getCurrentSettings(configOpt.max_return, offset)}
	<p>Loading...</p>
{:then settings}
	<SettingsView
		{clusterModules}
		{configOpt}
		{module}
		{guildData}
		{guildId}
		{settings}
		bind:offset
	/>
{:catch err}
	<Message type="error"><strong>Error</strong>{@html err?.message || err}</Message>
{/await}
