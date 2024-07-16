<script lang="ts">
	import {
		CanonicalModule,
		FullGuildCommandConfiguration,
		GuildCommandConfiguration,
		GuildModuleConfiguration
	} from '$lib/generated/silverpelt';
	import logger from '$lib/ui/logger';
	import NavButton from '../../../components/inputs/button/NavButton.svelte';
	import { Readable } from 'svelte/store';
	import InputText from '../../../components/inputs/InputText.svelte';
	import { DataHandler } from '@vincjo/datatables';
	import { UserGuildBaseData } from '$lib/generated/types';
	import TabbedPane from '../../../components/inputs/button/tabs/TabbedPane.svelte';
	import {
		LookedUpCommand,
		ParsedCanonicalCommandData,
		commandLookup,
		extractCommandsFromModule
	} from '$lib/ui/commands';
	import ModuleInfoTab from './tab:moduleinfo/ModuleInfoTab.svelte';
	import CommandTab from './tab:commands/CommandTab.svelte';
	import { CommonPermissionContext } from '../../../components/dashboard/permissions/commonPermissionContext';
	import SettingsTab from './tab:settings/SettingsTab.svelte';

	export let clusterModules: Record<string, CanonicalModule>;
	export let commonPermissionContext: CommonPermissionContext;
	export let guildId: string;
	export let currentModuleConfiguration: GuildModuleConfiguration[];
	export let currentCommandConfiguration: FullGuildCommandConfiguration[];
	export let guildData: UserGuildBaseData;
	export let guildClusterId: number;
	export let guildShardId: number;

	interface State {
		openModule: string;
		openModuleTab: string;
		commandSearch: string;
		searchedCommands: LookedUpCommand[];
		clusterFinderOpen: boolean;
		commandEditOpen?: ParsedCanonicalCommandData;
		commandEditConfigs: FullGuildCommandConfiguration[];
		commandEditorOpen: boolean;
		clusterFinderByGuildIdExpectedData: {
			cluster: number;
			shard: number;
		} | null;
	}

	let state: State = {
		openModule: '',
		openModuleTab: 'moduleInfo',
		commandSearch: '',
		searchedCommands: [],
		clusterFinderOpen: false,
		commandEditorOpen: false,
		commandEditConfigs: [],
		clusterFinderByGuildIdExpectedData: null
	};

	$: {
		if (!state.openModule) {
			// Find first non-hidden module
			for (let module of Object.values(clusterModules)) {
				state.openModule = module?.id;
				break;
			}
		}
	}

	$: if (state) {
		logger.info('ModuleConf.State', state);
	}

	$: if (state?.commandSearch && clusterModules && state.commandSearch) {
		state.searchedCommands = commandLookup(clusterModules, state.commandSearch);
	} else {
		state.searchedCommands = [];
	}

	let cmdDataTable: Readable<ParsedCanonicalCommandData[]>;
	const createCmdDataTable = async (_: string) => {
		let module = clusterModules[state.openModule];

		let commands = extractCommandsFromModule(module);

		const handler = new DataHandler(commands, { rowsPerPage: 20 });

		cmdDataTable = handler.getRows();

		return {
			handler,
			rows: cmdDataTable
		};
	};
</script>

<!--Cluster Menu at the right of the page-->
<article class="command-list-article overflow-x-auto overflow-y-hidden h-full">
	<small class="text-red-600 word-wrap block mb-1">
		Different clusters may have different available modules due to outages, A/B testing and other
		reasons. Your server is on cluster <strong>{guildClusterId}</strong>, shard
		<strong>{guildShardId}</strong>.
	</small>
	<section class="command-list flex flex-grow">
		<div class="cluster-map-content flex-1 flex-grow px-2">
			<!--Search bar-->
			<InputText
				id="command-search-bar"
				label="Command Lookup"
				placeholder="Search for a command"
				minlength={0}
				showErrors={false}
				bind:value={state.commandSearch}
			/>

			<ul>
				{#each state.searchedCommands as searchedCommand}
					<li class="cluster-search-command mb-7">
						<h3 class="text-xl font-bold">{searchedCommand?.command?.full_name}</h3>
						{#if searchedCommand?.command?.description}
							<p class="text-slate-200">{searchedCommand?.command?.description}</p>
						{/if}
						<p class="text-slate-200"><strong>Module:</strong> {searchedCommand?.module?.name}</p>
					</li>
				{/each}
			</ul>

			<!--Module list-->
			<section class="cluster-module-list flex flex-grow">
				<!--Bar-->
				<nav class="cluster-map flex-none w-52">
					<section class="guild-basic-details mb-2">
						<!--Avatar-->
						<img loading="lazy" src={guildData.icon} class="h-10 m-0 align-middle inline" alt="" />
						<!--Guild Name-->
						<span class="font-semibold align-middle m-0">{guildData.name}</span>
					</section>

					<hr class="mb-2" />

					{#each Object.entries(clusterModules) as [_, module]}
						<NavButton
							current={state.openModule == module?.id}
							title={module?.name}
							onClick={() => {
								state.openModule = module?.id || clusterModules['core'].id;
							}}
							extClass="block mb-2 w-full"
						/>
					{/each}
				</nav>

				<!--Content-->
				<div class="cluster-module-list-content flex-1 flex-grow px-2 mb-auto">
					{#if state.openModule}
						<h1 class="text-2xl font-semibold">
							{clusterModules[state.openModule]?.name}
						</h1>
						<p class="text-slate-200">{clusterModules[state.openModule]?.description}</p>

						<TabbedPane
							bind:visibleTab={state.openModuleTab}
							tabs={[
								{ id: 'moduleInfo', label: 'Info' },
								{ id: 'cmdList', label: 'Commands' },
								{ id: 'settings', label: 'Settings' }
							]}
						/>
						{#if state.openModuleTab == 'moduleInfo'}
							<ModuleInfoTab
								{guildId}
								module={clusterModules[state.openModule]}
								{commonPermissionContext}
								bind:currentModuleConfiguration
							/>
						{:else if state.openModuleTab == 'cmdList'}
							<CommandTab
								{guildId}
								moduleId={state.openModule}
								{clusterModules}
								{commonPermissionContext}
								bind:currentCommandConfiguration
							/>
						{:else if state.openModuleTab == 'settings'}
							<SettingsTab {guildId} module={clusterModules[state.openModule]} />
						{/if}
					{/if}
				</div>
			</section>
		</div>
	</section>
</article>

<details>
	<summary class="hover:cursor-pointer">Debug</summary>
	<pre>{JSON.stringify(state, null, 4)}</pre>
</details>
