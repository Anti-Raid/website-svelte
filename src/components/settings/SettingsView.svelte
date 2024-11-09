<script lang="ts">
	import { CanonicalConfigOption, CanonicalModule } from '$lib/generated/silverpelt';

	import { SettingsExecuteResponse, UserGuildBaseData } from '$lib/generated/types';
	import SettingsCreateRow from './SettingsCreateRow.svelte';
	import SettingsRow from './SettingsRow.svelte';

	export let modules: Record<string, CanonicalModule>;
	export let configOpt: CanonicalConfigOption;
	export let module: CanonicalModule;
	export let guildData: UserGuildBaseData;
	export let guildId: string;
	export let settings: SettingsExecuteResponse;
	export let offset: number;
</script>

<div class="setting" id={configOpt.id}>
	{#if (!configOpt?.max_entries || settings?.fields?.length < configOpt?.max_entries) && configOpt?.operations['Create']}
		<SettingsCreateRow bind:settings {configOpt} {module} {guildData} {guildId} {modules} />
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
			{modules}
		/>
	{/each}
</div>

{#if !(offset - configOpt.max_return < 0) || !(settings?.fields?.length >= configOpt.max_return)}
	<div class="grid-cols-2 grid">
		<div class="col-span-1 border border-surface-400 p-2 bg-surface-500 hover:bg-surface-500/75 rounded-bl-lg">
			<button
				disabled={offset - configOpt.max_return < 0}
				aria-disabled={offset - configOpt.max_return < 0}
				class={offset - configOpt.max_return >= 0
					? 'block w-full text-left font-semibold'
					: 'block w-full text-left font-cabin font-extrabold uppercase cursor-not-allowed'}
				on:click|preventDefault={() => {
					if (offset - configOpt.max_return < 0) {
						offset = 0;
					} else {
						offset -= configOpt.max_return;
					}
				}}>Back</button
			>
		</div>
        
		<div class="col-span-1 border border-surface-400 p-2 bg-surface-500 hover:bg-surface-500/75 rounded-br-lg">
			<button
				disabled={settings?.fields?.length >= configOpt.max_return}
				aria-disabled={settings?.fields?.length >= configOpt.max_return}
				class={settings?.fields?.length >= configOpt.max_return
					? 'block w-full text-left font-semibold'
					: 'block w-full text-left font-cabin font-extrabold uppercase cursor-not-allowed'}
				on:click|preventDefault={() => {
					if (settings?.fields?.length < configOpt.max_return) return;
					offset += configOpt.max_return;
				}}>Next</button
			>
		</div>
	</div>
{/if}

<div class="my-3" />