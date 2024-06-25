<script lang="ts">
	import { InstanceList } from '$lib/generated/mewld/proc';
	import {
		CanonicalModule,
		GuildCommandConfiguration,
		GuildModuleConfiguration
	} from '$lib/generated/silverpelt';
	import logger from '$lib/ui/logger';
	import Message from '../../../components/Message.svelte';
	import NavButton from '../../../components/inputs/button/NavButton.svelte';
	import { Readable } from 'svelte/store';
	import InputText from '../../../components/inputs/InputText.svelte';
	import { DataHandler } from '@vincjo/datatables';
	import { UserGuildBaseData } from '$lib/generated/types';
	import TabbedPane from '../../../components/inputs/button/tabs/TabbedPane.svelte';
	import CommandEditor from './CommandEditor.svelte';
	import Pagination from '../../../components/common/datatable/Pagination.svelte';
	import RowCount from '../../../components/common/datatable/RowCount.svelte';
	import RowsPerPage from '../../../components/common/datatable/RowsPerPage.svelte';
	import Search from '../../../components/common/datatable/Search.svelte';
	import ThFilter from '../../../components/common/datatable/ThFilter.svelte';
	import ThSort from '../../../components/common/datatable/ThSort.svelte';
	import {
		LookedUpCommand,
		ParsedCanonicalCommandData,
		commandLookup,
		extractCommandsFromModule,
		getCommandConfigurations,
		getCommandName
	} from '$lib/ui/commands';
	import ModuleInfoTab from './ModuleInfoTab.svelte';

	export let instanceList: InstanceList;
	export let clusterModules: Record<string, CanonicalModule>;
	export let guildId: string;
	export let currentModuleConfiguration: GuildModuleConfiguration[];
	export let currentCommandConfiguration: GuildCommandConfiguration[];
	export let guildData: UserGuildBaseData;
	export let guildClusterId: number;
	export let guildShardId: number;

	const findModuleInCmc = (
		currentModuleConfiguration: GuildModuleConfiguration[],
		module: string
	) => {
		return currentModuleConfiguration.find((cmc) => cmc.module == module);
	};

	interface State {
		togglingStates: Record<string, ['loading' | 'error' | 'success', string]>;
		openModule: string;
		openMobuleTab: string;
		commandSearch: string;
		searchedCommands: LookedUpCommand[];
		clusterFinderOpen: boolean;
		commandEditOpen?: ParsedCanonicalCommandData;
		commandEditConfigs: GuildCommandConfiguration[];
		commandEditorOpen: boolean;
		clusterFinderByGuildIdExpectedData: {
			cluster: number;
			shard: number;
		} | null;
	}

	let state: State = {
		togglingStates: {},
		openModule: '',
		openMobuleTab: 'moduleInfo',
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

		let commands = await extractCommandsFromModule(module);

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
						<h3 class="text-xl font-bold">{searchedCommand?.command?.command?.name}</h3>
						{#if searchedCommand?.command?.command?.description}
							<p class="text-slate-200">{searchedCommand?.command?.command?.description}</p>
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
							bind:visibleTab={state.openMobuleTab}
							tabs={[
								{ id: 'moduleInfo', label: 'Info' },
								{ id: 'cmdList', label: 'Commands' },
								{ id: 'settings', label: 'Settings' }
							]}
						/>
						{#if state.openMobuleTab == 'moduleInfo'}
							<ModuleInfoTab
								{guildId}
								module={clusterModules[state.openModule]}
								{currentModuleConfiguration}
							/>
						{:else if state.openMobuleTab == 'cmdList'}
							{#await createCmdDataTable(state?.openModule)}
								<Message type="loading">Loading commands...</Message>
							{:then data}
								<div class="overflow-x-auto space-y-4">
									<!-- Header -->
									<header class="flex justify-between gap-4">
										<Search handler={data.handler} />
										<RowsPerPage handler={data.handler} />
									</header>

									<div class="p-1" />

									<!-- Table -->
									<table class="table table-hover table-compact bg-surface-600 w-full table-auto">
										<thead>
											<tr class="bg-surface-800">
												<ThSort handler={data.handler} orderBy={'full_name'}>Name</ThSort>
												<ThSort handler={data.handler} orderBy={'description'}>Description</ThSort>
												<ThSort handler={data.handler} orderBy={'arguments'}>Arguments</ThSort>
												<ThSort handler={data.handler} orderBy={'full_name'}>Manage</ThSort>
											</tr>

											<tr class="bg-surface-800">
												<ThFilter handler={data.handler} filterBy={'full_name'} />
												<ThFilter handler={data.handler} filterBy={'description'} />
												<ThFilter handler={data.handler} filterBy={'arguments'} />
												<ThFilter handler={data.handler} filterBy={'full_name'} />
											</tr>
										</thead>

										<tbody>
											{#each $cmdDataTable as row}
												<tr>
													<td>
														{#if row.subcommand_depth == 0}
															<span class="font-semibold">
																{row.name}
															</span>
														{:else}
															<span class="whitespace-nowrap">
																<span class="font-semibold">{row?.parent_command?.name}</span
																>{' '}<em>{row.name}</em>
															</span>
														{/if}

														<!--NSFW command, TODO: Make tooltip-->
														{#if row.nsfw}
															<div class="command-note">
																<span class="text-red-400 font-semibold">NSFW</span>
															</div>
														{/if}

														<!--Base command of a slash command, TODO: Make tooltip-->
														{#if row.subcommand_required || row.subcommands.length}
															<div class="command-note">
																<span class="text-blue-400 font-semibold">BASE</span>
															</div>
														{/if}
													</td>
													<td>
														{#if row.description}
															{row.description}
														{:else}
															Mystery Box?
														{/if}
													</td>
													<td>
														<ul class="list-disc list-outside">
															{#each row.arguments as arg, i}
																<li class={i + 1 < row.arguments.length ? 'mb-2' : ''}>
																	<span class="command-argument">
																		<span class="font-semibold">{arg.name}</span
																		>{#if arg.required}<span
																				class="text-red-400 font-semibold text-lg"
																				>*<span class="sr-only">Required parameter)</span></span
																			>{/if}{#if arg.description}: <em>{arg.description}</em>{/if}
																	</span>
																</li>
															{/each}
														</ul>
													</td>
													<td>
														<button
															class="text-primary-400 hover:text-primary-500"
															on:click={() => {
																logger.info('EditCommand', 'Editing command', row);
																state.commandEditorOpen = false;
																state.commandEditOpen = undefined;
																state.commandEditOpen = row;
																state.commandEditConfigs = getCommandConfigurations(
																	clusterModules,
																	currentCommandConfiguration,
																	guildId,
																	getCommandName(state.commandEditOpen)
																);
																state.commandEditorOpen = true;
															}}
														>
															Edit
														</button>
													</td>
												</tr>
											{/each}
										</tbody>
									</table>
								</div>

								<div class="p-1" />

								<!-- Footer -->
								<footer class="flex justify-between">
									<RowCount handler={data.handler} />
									<Pagination handler={data.handler} />
								</footer>
							{:catch err}
								<Message type="error">
									Failed to load commands: {err}
								</Message>
							{/await}
						{:else if state.openMobuleTab == 'settings'}
							<p class="text-slate-200">
								<strong>Settings for this module are not yet available.</strong>
							</p>
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

{#if state.commandEditOpen}
	<CommandEditor
		bind:isOpen={state.commandEditorOpen}
		commandName={getCommandName(state.commandEditOpen)}
		commandConfigs={state.commandEditConfigs}
	/>
{/if}

<style>
	tbody tr:hover {
		background: #252323;
	}
</style>
