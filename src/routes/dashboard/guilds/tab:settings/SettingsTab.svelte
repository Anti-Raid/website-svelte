<script lang="ts">
	import { CanonicalModule } from '$lib/generated/silverpelt';
	import Setting from '../../../../components/settings/Setting.svelte';
	import Message from '../../../../components/Message.svelte';
	import { UserGuildBaseData } from '$lib/generated/types';

	export let modules: Record<string, CanonicalModule>;
	export let guildId: string;
	export let module: CanonicalModule;
	export let guildData: UserGuildBaseData;
</script>

{#if module.config_options.length == 0}
	<Message type="info">No settings found for this module</Message>
{:else}
	{#each module.config_options as configOpt}
		<Setting {module} {configOpt} {guildId} {guildData} {modules} />
		<hr />
	{/each}
{/if}
