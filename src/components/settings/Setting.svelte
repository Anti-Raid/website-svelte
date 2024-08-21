<script lang="ts">
	import { CanonicalConfigOption, CanonicalModule } from '$lib/generated/silverpelt';
	import { SettingsExecute, UserGuildBaseData } from '$lib/generated/types';
	import Label from '../inputs/Label.svelte';
	import Message from '../Message.svelte';
	import SettingsCreateRow from './SettingsCreateRow.svelte';
	import SettingsRow from './SettingsRow.svelte';
	import { settingsFetchQueue } from './types';

	export let clusterModules: Record<string, CanonicalModule>;
	export let configOpt: CanonicalConfigOption;
	export let module: CanonicalModule;
	export let guildData: UserGuildBaseData;
	export let guildId: string;
	export let filters: Record<string, any> = {}; // Any filters to apply
	export let debugMode: boolean = false;

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
	<div class="setting" id={configOpt.id}>
		{#if settings?.fields?.length < configOpt?.max_entries && configOpt?.operations['Create']}
			<SettingsCreateRow
				{settings}
				{configOpt}
				{module}
				{guildData}
				{guildId}
				{debugMode}
				{clusterModules}
			/>
		{/if}

		{#each settings?.fields || [] as columnField, i}
			<SettingsRow
				columnField={structuredClone(columnField)}
				index={i}
				{module}
				{guildData}
				{guildId}
				{configOpt}
				{settings}
				{debugMode}
				{clusterModules}
			/>
		{/each}
	</div>

	<div class="grid-cols-2 grid">
		<div class="col-span-1 border p-2 bg-black hover:bg-slate-900">
			<button
				disabled={offset - configOpt.max_return < 0}
				aria-disabled={offset - configOpt.max_return < 0}
				class={offset - configOpt.max_return >= 0
					? 'block w-full text-left font-semibold'
					: 'block w-full text-left italic cursor-not-allowed'}
				on:click|preventDefault={() => {
					if (offset - configOpt.max_return < 0) {
						offset = 0;
					} else {
						offset -= configOpt.max_return;
					}
				}}>Back</button
			>
		</div>
		<div class="col-span-1 border p-2 bg-black hover:bg-slate-900">
			<button
				disabled={settings?.fields?.length >= configOpt.max_return}
				aria-disabled={settings?.fields?.length >= configOpt.max_return}
				class={settings?.fields?.length >= configOpt.max_return
					? 'block w-full text-left font-semibold'
					: 'block w-full text-left italic cursor-not-allowed'}
				on:click|preventDefault={() => {
					if (settings?.fields?.length < configOpt.max_return) return;
					offset += configOpt.max_return;
				}}>Next</button
			>
		</div>
	</div>
{:catch err}
	<Message type="error"><strong>Error</strong>{@html err?.message || err}</Message>
{/await}
