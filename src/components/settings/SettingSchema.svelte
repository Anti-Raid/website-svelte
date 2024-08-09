<script lang="ts">
	import { CanonicalConfigOption, CanonicalModule } from '$lib/generated/silverpelt';
	import { SettingsExecuteResponse, UserGuildBaseData } from '$lib/generated/types';
	import SettingsRow from './SettingsRow.svelte';
	import SettingsCreateRow from './SettingsCreateRow.svelte';

	export let clusterModules: Record<string, CanonicalModule>;
	export let configOpt: CanonicalConfigOption;
	export let module: CanonicalModule;
	export let guildData: UserGuildBaseData;
	export let guildId: string;
	export let settings: SettingsExecuteResponse;
	export let debugMode: boolean = false;
</script>

{#if settings?.fields?.length < configOpt?.max_entries}
	<SettingsCreateRow
		bind:settings
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
		bind:settings
		{debugMode}
		{clusterModules}
	/>
{/each}
