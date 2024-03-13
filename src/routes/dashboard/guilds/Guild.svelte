<script lang="ts">
	import { InstanceList } from "$lib/generated/mewld/proc";
	import { CanonicalModule, GuildModuleConfiguration } from "$lib/generated/silverpelt";
	import { UserGuildBaseData } from "$lib/generated/types";
	import ModuleConf from "./ModuleConf.svelte";

    export let guildId: string;
    export let currentModuleConfiguration: GuildModuleConfiguration[];
    export let guildData: UserGuildBaseData;
    export let instanceList: InstanceList;
    export let guildShardId: number;
    export let guildClusterId: number;
    export let clusterModules: Record<string, CanonicalModule>
</script>

<ModuleConf 
    {guildId}
    {currentModuleConfiguration}
    {instanceList}
    {guildData}
    {guildClusterId}
/>
