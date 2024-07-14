<script lang="ts">
	import { CanonicalConfigOption, CanonicalModule } from '$lib/generated/silverpelt';
	import { SettingsExecuteResponse } from '$lib/generated/types';
	import SettingsRow from './SettingsRow.svelte';
	import { OperationTypes } from './types';

	export let configOpt: CanonicalConfigOption;
	export let module: CanonicalModule;
	export let guildId: string;
	export let settings: SettingsExecuteResponse;
	export let currentOperationType: OperationTypes = 'View';
</script>

{#each settings?.fields || [] as columnField, i}
	<SettingsRow
		columnField={structuredClone(columnField)}
		index={i}
		{module}
		{guildId}
		{configOpt}
		{currentOperationType}
		bind:settings
	/>
{/each}
