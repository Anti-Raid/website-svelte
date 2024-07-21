<script lang="ts">
	import {
		CanonicalModule,
		FullGuildCommandConfiguration,
		GuildModuleConfiguration
	} from '$lib/generated/silverpelt';
	import NavButton from '../../../../components/inputs/button/NavButton.svelte';
	import InputText from '../../../../components/inputs/InputText.svelte';
	import { UserGuildBaseData } from '$lib/generated/types';
	import TabbedPane from '../../../../components/inputs/button/tabs/TabbedPane.svelte';
	import {
		LookedUpCommand,
		ParsedCanonicalCommandData,
		commandLookup,
		extractCommandsFromModule
	} from '$lib/ui/commands';
	import ModuleInfoTab from '../tab:moduleinfo/ModuleInfoTab.svelte';
	import CommandTab from '../tab:commands/CommandTab.svelte';
	import { CommonPermissionContext } from '../../../../components/dashboard/permissions/commonPermissionContext';
	import SettingsTab from '../tab:settings/SettingsTab.svelte';
	import { InstanceList } from '$lib/generated/mewld/proc';
	import Icon from '@iconify/svelte';

	export let clusterModules: Record<string, CanonicalModule>;
	export let commonPermissionContext: CommonPermissionContext;
	export let guildId: string;
	export let instanceList: InstanceList;
	export let currentModuleConfiguration: GuildModuleConfiguration[];
	export let currentCommandConfiguration: FullGuildCommandConfiguration[];
	export let guildData: UserGuildBaseData;
	export let guildClusterId: number;
	export let guildShardId: number;

	interface OpenedEntity {
		indexPage?: {};
		module?: { id: string; tab: string };
		quickAction?: { id: string };
	}

	interface State {
		openedEntity: OpenedEntity;
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
		openedEntity: { indexPage: {} },
		commandSearch: '',
		searchedCommands: [],
		clusterFinderOpen: false,
		commandEditorOpen: false,
		commandEditConfigs: [],
		clusterFinderByGuildIdExpectedData: null
	};

	$: if (state?.commandSearch && clusterModules && state.commandSearch) {
		state.searchedCommands = commandLookup(clusterModules, state.commandSearch);
	} else {
		state.searchedCommands = [];
	}
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
					<section class="guild-basic-details">
						<!--Avatar-->
						<img loading="lazy" src={guildData.icon} class="h-10 m-0 align-middle inline" alt="" />
						<!--Guild Name-->
						<span class="font-semibold align-middle m-0">{guildData.name}</span>
					</section>

					<NavButton
						current={!!state.openedEntity.indexPage}
						title={'⌂ Home'}
						onClick={() => {
							state.openedEntity = { indexPage: {} };
						}}
						extClass="block mb-2 w-full"
					/>

					<hr class="mb-4" />

					<h2 class="font-semibold">Quick Actions</h2>

					<NavButton
						current={state.openedEntity.quickAction?.id == 'welcome-messages'}
						title={'Welcome Messages'}
						onClick={() => {
							state.openedEntity = { quickAction: { id: 'welcome-messages' } };
						}}
						extClass="block mb-2 w-full"
					/>

					<h2 class="font-semibold">Modules</h2>

					{#each Object.entries(clusterModules) as [_, module]}
						<NavButton
							current={state.openedEntity?.module?.id == module?.id}
							title={module?.name}
							onClick={() => {
								state.openedEntity = { module: { id: module?.id, tab: 'moduleInfo' } };
							}}
							extClass="block mb-2 w-full"
						/>
					{/each}
				</nav>

				<!--Content-->
				{#if state.openedEntity.indexPage}
					<div class="cluster-module-list-content flex-1 flex-grow px-2 mb-auto">
						<h1 class="text-2xl font-semibold">Welcome!</h1>
						<p class="text-slate-200">
							Using the dashboard, you can control almost all aspects of Anti-Raid and its operation
							on your server!
						</p>

						<h2 class="mt-5 text-xl font-semibold">Quick Actions!</h2>

						<p class="text-slate-200">
							On the left of the screen, you will be able to see a list of "Quick Actions". These
							tabs provide simplified UIs for the most common functionality used by most servers.
						</p>

						<div class="mb-2" />

						<div class="col-span-8 grid grid-cols-1 gap-6 lg:grid-cols-2 h-full w-full">
							<button
								on:click={() => {
									state.openedEntity = { quickAction: { id: 'welcome-messages' } };
								}}
								class="block top-0 text-left items-start index-page-button p-4 border rounded-sm bg-slate-800 hover:bg-transparent shadow"
							>
								<div class="h-full text-white">
									<Icon icon="bx:bx-message-square-detail" class="block text-4xl m-auto" />
									<span class="block font-semibold m-auto text-center">Welcome Messages</span>
									<small class="mt-0.5 block opacity-80 text-left">
										Set up a welcome message for new members joining your server. This can help
										increase engagement while letting moderators know exactly who's coming!
									</small>
								</div>
							</button>
						</div>

						<h2 class="mt-5 text-xl font-semibold">Modules!</h2>

						<p class="text-slate-200">
							Also on the left of the screen are modules that together make up the core of
							Anti-Raid. As a server manager, you can use the modules system to enable/disable the
							module and all events/commands pertaining to it as well as delegate default
							permissions for commands within a module for macro level control.
						</p>

						<div class="mb-2" />

						<div class="col-span-8 grid grid-cols-1 gap-6 lg:grid-cols-3 h-full w-full">
							{#each Object.values(clusterModules) as clusterModule}
								<button
									class="block top-0 text-left items-start index-page-button p-4 border rounded-sm bg-slate-800 hover:bg-transparent shadow"
									on:click={() => {
										state.openedEntity = { module: { id: clusterModule.id, tab: 'moduleInfo' } };
									}}
								>
									<div class="h-full text-white">
										<Icon icon="bx:book" class="block text-4xl m-auto" />
										<span class="block font-semibold m-auto text-center">{clusterModule.name}</span>
										<small class="block opacity-80 text-left">
											{clusterModule.description}
										</small>
									</div>
								</button>
							{/each}
						</div>
					</div>
				{:else if state.openedEntity.module}
					<div class="cluster-module-list-content flex-1 flex-grow px-2 mb-auto">
						<h1 class="text-2xl font-semibold">
							{clusterModules[state.openedEntity.module.id]?.name}
						</h1>
						<p class="text-slate-200">
							{clusterModules[state.openedEntity.module.id]?.description}
						</p>

						<TabbedPane
							bind:visibleTab={state.openedEntity.module.tab}
							tabs={[
								{ id: 'moduleInfo', label: 'Info' },
								{ id: 'cmdList', label: 'Commands' },
								{ id: 'settings', label: 'Settings' }
							]}
						/>
						{#if state.openedEntity.module.tab == 'moduleInfo'}
							<ModuleInfoTab
								{guildId}
								module={clusterModules[state.openedEntity.module.id]}
								{commonPermissionContext}
								bind:currentModuleConfiguration
							/>
						{:else if state.openedEntity.module.tab == 'cmdList'}
							<CommandTab
								{guildId}
								moduleId={state.openedEntity.module.id}
								{clusterModules}
								{commonPermissionContext}
								bind:currentCommandConfiguration
							/>
						{:else if state.openedEntity.module.tab == 'settings'}
							<SettingsTab
								{guildId}
								module={clusterModules[state.openedEntity.module.id]}
								{guildData}
							/>
						{/if}
					</div>
				{/if}
			</section>
		</div>
	</section>
</article>

<details>
	<summary class="hover:cursor-pointer">Debug</summary>
	<pre>{JSON.stringify(state, null, 4)}</pre>
</details>

<style>
	.index-page-button {
		transition: all 0.1s;
		box-shadow: 0 4px 8px 0 #23272a, 0 6px 20px 0 rgba(0, 0, 0, 0.19);
	}

	.index-page-button:hover {
		transform: translate(0px, -1px);
	}
</style>
