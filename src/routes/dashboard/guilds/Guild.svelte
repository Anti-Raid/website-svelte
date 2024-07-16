<script lang="ts">
	import { InstanceList } from '$lib/generated/mewld/proc';
	import {
		CanonicalModule,
		FullGuildCommandConfiguration,
		GuildCommandConfiguration,
		GuildModuleConfiguration
	} from '$lib/generated/silverpelt';
	import { UserGuildBaseData } from '$lib/generated/types';
	import logger from '$lib/ui/logger';
	import { CommonPermissionContext } from '../../../components/dashboard/permissions/commonPermissionContext';
	import ModuleConf from './ModuleConf.svelte';

	export let guildId: string;
	export let currentModuleConfiguration: GuildModuleConfiguration[];
	export let currentCommandConfiguration: FullGuildCommandConfiguration[];
	export let guildData: UserGuildBaseData;
	export let instanceList: InstanceList;
	export let guildShardId: number;
	export let guildClusterId: number;
	export let clusterModules: Record<string, CanonicalModule>;
	export let commonPermissionContext: CommonPermissionContext;

	$: logger.info('Guild', 'instanceList', instanceList);
</script>

<ModuleConf
	{guildId}
	{currentModuleConfiguration}
	{currentCommandConfiguration}
	{guildData}
	{guildClusterId}
	{guildShardId}
	{clusterModules}
	{commonPermissionContext}
/>
