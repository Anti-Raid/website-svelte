<script lang="ts">
	import { CanonicalModule } from '$lib/generated/silverpelt';
	import Setting from './Setting.svelte';
	import Message from '../../../../components/Message.svelte';
	import { UserGuildBaseData } from '$lib/generated/types';

	export let guildId: string;
	export let module: CanonicalModule;
	export let guildData: UserGuildBaseData;

	// Svelte workaround to workaround state
	//
	// If and only if the module id changes do we need to rederive the state
	let moduleId: string;

	$: if (module.id != moduleId) {
		moduleId = module.id;
	}
</script>

{#if module.config_options.length == 0}
	<Message type="info">No settings found for this module</Message>
{:else}
	{#each module.config_options as configOpt}
		<Setting {module} {configOpt} {guildId} {guildData} />
		<hr />
	{/each}
{/if}
