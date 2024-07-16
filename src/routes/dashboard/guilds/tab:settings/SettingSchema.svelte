<script lang="ts">
	import { CanonicalConfigOption, CanonicalModule } from '$lib/generated/silverpelt';
	import { SettingsExecuteResponse } from '$lib/generated/types';
	import Icon from '@iconify/svelte';
	import SettingsRow from './SettingsRow.svelte';
	import { OperationTypes } from './types';
	import SettingsCreateRow from './SettingsCreateRow.svelte';

	export let configOpt: CanonicalConfigOption;
	export let module: CanonicalModule;
	export let guildId: string;
	export let settings: SettingsExecuteResponse;
	export let debugMode: boolean = false;
</script>

{#if settings?.fields?.length < configOpt?.max_entries}
	<SettingsCreateRow bind:settings {configOpt} {module} {guildId} {debugMode} />
{/if}

{#each settings?.fields || [] as columnField, i}
	<SettingsRow
		columnField={structuredClone(columnField)}
		index={i}
		{module}
		{guildId}
		{configOpt}
		bind:settings
		{debugMode}
	/>
{/each}
