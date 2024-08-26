<script lang="ts">
	import {
		CanonicalColumn,
		CanonicalConfigOption,
		CanonicalModule
	} from '$lib/generated/silverpelt';
	import { getDispatchType, deriveColumnState, ColumnState, DispatchType } from '$lib/ui/settings';
	import InputDispatcher from '../inputs/generic/InputDispatcher.svelte';
	import SettingsSuggestionBox from './SettingsSuggestionBox.svelte';
	import { DerivedData, OperationTypes } from './types';
	import logger from '$lib/ui/logger';
	import BoxButton from '../inputs/button/BoxButton.svelte';
	import Spacer from '../inputs/Spacer.svelte';
	import { SettingsExecuteResponse, UserGuildBaseData } from '$lib/generated/types';
	import SettingsCreateRow from './SettingsCreateRow.svelte';
	import SettingsRow from './SettingsRow.svelte';

	export let clusterModules: Record<string, CanonicalModule>;
	export let configOpt: CanonicalConfigOption;
	export let module: CanonicalModule;
	export let guildData: UserGuildBaseData;
	export let guildId: string;
	export let debugMode: boolean;
	export let settings: SettingsExecuteResponse;
	export let offset: number;
</script>

<div class="setting" id={configOpt.id}>
	{#if (!configOpt?.max_entries || settings?.fields?.length < configOpt?.max_entries) && configOpt?.operations['Create']}
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
			bind:settings
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
