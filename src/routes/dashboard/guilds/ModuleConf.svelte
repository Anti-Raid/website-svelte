<script lang="ts">
	import { InstanceList } from '$lib/generated/mewld/proc';
	import {
		CanonicalCommand,
		CanonicalCommandData,
		CanonicalModule,
		GuildCommandConfiguration,
		GuildModuleConfiguration
	} from '$lib/generated/silverpelt';
	import logger from '$lib/ui/logger';
	import Message from '../../../components/Message.svelte';
	import NavButton from '../../../components/inputs/button/NavButton.svelte';
	import ButtonReact from '../../../components/inputs/button/ButtonReact.svelte';
	import InputText from '../../../components/inputs/InputText.svelte';
	import { DataHandler, Datatable, Th, ThFilter } from '@vincjo/datatables';
	import { Readable, Writable, readable, writable } from 'svelte/store';
	import BoolInput from '../../../components/inputs/BoolInput.svelte';
	import { ApiError, UserGuildBaseData } from '$lib/generated/types';
	import { fetchClient } from '$lib/fetch/fetch';
	import { CanonicalCommandExtendedData } from '$lib/converters';
	import { get } from '$lib/configs/functions/services';
	import { getAuthCreds } from '$lib/auth/getAuthCreds';
	import UnorderedList from '../../../components/UnorderedList.svelte';
	import ListItem from '../../../components/ListItem.svelte';
	import Modal from '../../../components/Modal.svelte';
	import { Color } from '../../../components/inputs/button/colors';
	import TabbedPane from '../../../components/inputs/button/tabs/TabbedPane.svelte';
	import { permuteCommands } from '$lib/mewext/mewext';

	export let instanceList: InstanceList;
	export let clusterModules: Record<string, CanonicalModule>;
	export let guildId: string;
	export let currentModuleConfiguration: GuildModuleConfiguration[];
	export let currentCommandConfiguration: GuildCommandConfiguration[];
	export let guildData: UserGuildBaseData;
	export let guildClusterId: number;
	export let guildShardId: number;

	const getCommandConfigurations = (command: string): GuildCommandConfiguration[] => {
		let ccs = []; // List of command configurations to return

		let permuted_commands = permuteCommands(command);
		let base_command = permuted_commands[0];

		logger.info(
			'GetCommandConfigurations',
			'Getting command configurations for',
			command,
			permuted_commands,
			base_command
		);

		// For each permuted command, find the command configuration
		for (let permuted_command of permuted_commands) {
			let cc = currentCommandConfiguration.find((cmc) => cmc.command == permuted_command);

			if (cc) {
				ccs.push(cc);
			} else {
				// Try falling back to the default command configuration in clusterModules
				for (let module of Object.values(clusterModules)) {
					for (let cmd of module.commands) {
						if (cmd.command.name == base_command) {
							// The key on the extended data should be everything but the base command
							let extDataKey = permuted_command.split(' ').slice(1).join(' ');

							if (!cmd.extended_data[extDataKey]) {
								continue;
							}

							let cc: GuildCommandConfiguration = {
								id: '',
								guild_id: guildId,
								command: permuted_command,
								perms: cmd.extended_data[extDataKey].default_perms,
								disabled: cmd.extended_data[extDataKey].is_default_enabled
							};
							ccs.push(cc);
						}
					}
				}
			}
		}

		return ccs;
	};

	const findModuleInCmc = (
		currentModuleConfiguration: GuildModuleConfiguration[],
		module: string
	) => {
		return currentModuleConfiguration.find((cmc) => cmc.module == module);
	};

	const toggleModule = async (moduleName: string, enabled: boolean) => {
		let authData = getAuthCreds();

		if (!authData) {
			return [false, 'No auth data'];
		}

		let res = await fetchClient(
			`${get('splashtail')}/users/${
				authData.user_id
			}/guilds/${guildId}/toggle-module?module=${moduleName}&disabled=${!enabled}`,
			{
				method: 'PUT',
				auth: authData.token
			}
		);

		if (!res.ok) {
			return [false, res];
		}

		let cmc = findModuleInCmc(currentModuleConfiguration, moduleName);

		if (!cmc) {
			// Create new module
			currentModuleConfiguration.push({
				id: '',
				guild_id: guildId,
				module: moduleName,
				disabled: !enabled
			});
		} else {
			// Update existing module
			cmc.disabled = !enabled;
		}

		return [true, null];
	};

	const toggleCommand = async (command: string, enabled: boolean) => {
		let authData = getAuthCreds();

		if (!authData) {
			return [false, 'No auth data'];
		}

		let res = await fetchClient(
			`${get('splashtail')}/users/${
				authData.user_id
			}/guilds/${guildId}/toggle-command?command=${command}&disabled=${!enabled}`,
			{
				method: 'PUT',
				auth: authData.token
			}
		);

		if (!res.ok) {
			return [false, res];
		}

		return [true, null];
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

	let state: Writable<State> = writable({
		togglingStates: {},
		openModule: 'core',
		openMobuleTab: 'cmdList',
		commandSearch: '',
		searchedCommands: [],
		clusterFinderOpen: false,
		commandEditorOpen: false,
		commandEditConfigs: [],
		clusterFinderByGuildIdExpectedData: null
	});

	interface LookedUpCommand {
		command: CanonicalCommand;
		module: CanonicalModule;
	}
	const commandLookup = (): LookedUpCommand[] => {
		let moduleData = clusterModules;
		if (!moduleData) return [];

		let commands: LookedUpCommand[] = [];

		for (let module of Object.values(moduleData)) {
			if (module?.web_hidden) continue; // Skip web_hidden modules, they are internal and are not publicly usable anyways

			for (let command of module?.commands) {
				let checkProps = [
					command?.command?.name,
					command?.command?.qualified_name,
					command?.command?.description,
					...command?.command?.subcommands?.map((subcommand) => subcommand?.name),
					...command?.command?.subcommands?.map((subcommand) => subcommand?.qualified_name),
					...command?.command?.subcommands?.map((subcommand) => subcommand?.description)
				];

				if (
					checkProps.some((prop) =>
						prop?.toLowerCase()?.includes($state.commandSearch?.toLowerCase())
					)
				) {
					commands.push({
						command,
						module
					});
				}
			}
		}

		return commands;
	};

	$: if ($state) {
		logger.info('ModuleConf.State', $state);
	}

	$: if ($state?.commandSearch) {
		$state.searchedCommands = commandLookup();
	} else {
		$state.searchedCommands = [];
	}

	interface ParsedCanonicalCommandData extends CanonicalCommandData {
		subcommand_depth: number;
		parent_command?: CanonicalCommandData;
		extended_data: CanonicalCommandExtendedData;
		extended_data_map: Record<string, CanonicalCommandExtendedData>;
		search_permissions: string;
	}

	// Returns the name of a command
	const getCommandName = (cmd: ParsedCanonicalCommandData) => {
		return cmd?.subcommand_depth == 0 ? cmd?.name : `${cmd?.parent_command?.name} ${cmd?.name}`;
	};

	let cmdDataTable: Readable<ParsedCanonicalCommandData[]>;
	const createCmdDataTable = async (_: string) => {
		let module = clusterModules[$state.openModule];

		let commands: ParsedCanonicalCommandData[] = [];

		// Recursively parse commands
		const parseCommand = (
			command: CanonicalCommandData,
			extended_data: Record<string, CanonicalCommandExtendedData>,
			depth: number = 0,
			parent: CanonicalCommandData | undefined
		) => {
			let extData = extended_data[depth == 0 ? '' : command?.name] || extended_data[''];
			logger.info('ParseCommand', 'Parsing command', command?.name, depth, parent, extData);
			commands.push({
				...command,
				subcommand_depth: depth,
				parent_command: parent,
				extended_data: extData,
				extended_data_map: extended_data,
				search_permissions: extData?.default_perms?.checks
					?.map((check) => check?.kittycat_perms)
					?.join(', ')
			});

			if (command?.subcommands) {
				for (let subcommand of command?.subcommands) {
					parseCommand(subcommand, extended_data, depth + 1, command);
				}
			}
		};

		for (let command of module?.commands) {
			let extData: Record<string, CanonicalCommandExtendedData> = {};

			for (let id in command?.extended_data) {
				extData[id] = {
					id,
					...command?.extended_data[id]
				};
			}

			logger.info('ParseCommand.ExtData', 'Got extended data', extData);

			parseCommand(command?.command, extData, 0, undefined);
		}

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
				bind:value={$state.commandSearch}
			/>

			<ul>
				{#each $state.searchedCommands as searchedCommand}
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
						{#if !module?.web_hidden}
							<NavButton
								current={$state.openModule == module?.id}
								title={module?.name}
								onClick={() => {
									$state.openModule = module?.id || clusterModules['core'].id;
								}}
								extClass="block mb-2 w-full"
							/>
						{/if}
					{/each}
				</nav>
				<!--Content-->
				<div class="cluster-module-list-content flex-1 flex-grow px-2 mb-auto">
					{#if $state.openModule}
						<h1 class="text-2xl font-semibold">
							{clusterModules[$state.openModule]?.name}
						</h1>
						<p class="text-slate-200">{clusterModules[$state.openModule]?.description}</p>

						<details>
							<summary class="hover:cursor-pointer">Misc Details</summary>
							<UnorderedList>
								<ListItem>
									{#if clusterModules[$state.openModule]?.commands_configurable}
										<small class="text-green-500 mt-2">
											<strong>Commands in this module are individually CONFIGURABLE</strong>
										</small>
									{:else}
										<small class="text-red-500 mt-2">
											<strong>Commands in this module are NOT individually CONFIGURABLE</strong>
										</small>
									{/if}
								</ListItem>

								<ListItem>
									{#if clusterModules[$state.openModule]?.web_hidden}
										<small class="text-red-500 mt-2">
											<strong>This module is HIDDEN on the website and dashboard</strong>
										</small>
									{:else}
										<small class="text-green-500 mt-2">
											<strong>This module is VISIBLE on the website and dashboard</strong>
										</small>
									{/if}
								</ListItem>

								<ListItem>
									{#if clusterModules[$state.openModule]?.toggleable}
										<small class="text-green-500 mt-2">
											<strong>This module can be enabled/disabled (TOGGLEABLE)</strong>
										</small>
									{:else}
										<small class="text-red-500 mt-2">
											<strong>This module cannot be enabled/disabled (IS NOT TOGGLEABLE)</strong>
										</small>
									{/if}
								</ListItem>
							</UnorderedList>
						</details>

						{#if clusterModules[$state.openModule]?.toggleable}
							<BoolInput
								id="enabled"
								label="Module Enabled"
								description="Toggle this module on or off"
								disabled={false}
								value={findModuleInCmc(currentModuleConfiguration, $state?.openModule)?.disabled ===
								undefined
									? clusterModules[$state.openModule]?.is_default_enabled
									: !findModuleInCmc(currentModuleConfiguration, $state?.openModule)?.disabled}
								onChange={async (v) => {
									$state.togglingStates[`mod/${$state.openModule}/toggle`] = [
										'loading',
										'Saving module $state...'
									];
									await toggleModule($state.openModule, v);
									$state.togglingStates[`mod/${$state.openModule}/toggle`] = [
										'success',
										v ? 'Successfully enabled module' : 'Successfully disabled module'
									];
								}}
							/>

							{#if $state.togglingStates[`mod/${$state.openModule}/toggle`]}
								<Message type={$state.togglingStates[`mod/${$state.openModule}/toggle`][0]}>
									{$state.togglingStates[`mod/${$state.openModule}/toggle`][1]}
								</Message>
							{/if}
						{/if}

						<BoolInput
							id="enabled-by-default"
							label="Enabled by default"
							description="Whether this module is enabled by default"
							disabled={true}
							value={clusterModules[$state.openModule]?.is_default_enabled}
							onChange={() => {}}
						/>

						<TabbedPane
							bind:visibleTab={$state.openMobuleTab}
							tabs={[
								{ id: 'cmdList', label: 'Commands' },
								{ id: 'settings', label: 'Settings' }
							]}
						/>
						{#if $state.openMobuleTab == 'cmdList'}
							{#await createCmdDataTable($state?.openModule)}
								<Message type="loading">Loading commands...</Message>
							{:then data}
								<Datatable handler={data.handler} search={false}>
									<table class="overflow-x-auto">
										<thead>
											<tr>
												<Th handler={data.handler} orderBy={'qualified_name'}>Name</Th>
												<Th handler={data.handler} orderBy={'description'}>Description</Th>
												<Th handler={data.handler} orderBy={'arguments'}>Arguments</Th>
												<Th handler={data.handler} orderBy={'qualified_name'}>Manage</Th>
											</tr>
											<tr>
												<ThFilter handler={data.handler} filterBy={'qualified_name'} />
												<ThFilter handler={data.handler} filterBy={'description'} />
												<ThFilter handler={data.handler} filterBy={'arguments'} />
												<ThFilter handler={data.handler} filterBy={'qualified_name'} />
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
															class="text-themable-400 hover:text-themable-500"
															on:click={() => {
																logger.info('EditCommand', 'Editing command', row);
																$state.commandEditorOpen = false;
																$state.commandEditOpen = undefined;
																$state.commandEditOpen = row;
																$state.commandEditConfigs = getCommandConfigurations(
																	getCommandName($state.commandEditOpen)
																);
																$state.commandEditorOpen = true;
															}}
														>
															Edit
														</button>
													</td>
												</tr>
											{/each}
										</tbody>
									</table>
								</Datatable>
							{:catch err}
								<Message type="error">
									Failed to load commands: {err}
								</Message>
							{/await}
						{:else if $state.openMobuleTab == 'settings'}
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
	<pre>{JSON.stringify($state, null, 4)}</pre>
</details>

{#if $state.commandEditOpen}
	<Modal
		bind:showModal={$state.commandEditorOpen}
		title={`Command '${getCommandName($state.commandEditOpen)}'`}
	>
		<h2 class="text-xl font-semibold">Related Command Configurations</h2>
		<ul>
			{#each $state.commandEditConfigs as commandConfig}
				<li>
					<details>
						<summary class="text-lg font-semibold hover:cursor-pointer"
							>{commandConfig.command}</summary
						>
						<BoolInput
							id={`cmd-enabled-${commandConfig.command}`}
							label="Command Enabled"
							description="Whether this command is enabled or not"
							disabled={false}
							value={!commandConfig?.disabled}
							onChange={async (v) => {
								$state.togglingStates[`cmd/${commandConfig.command}/toggle`] = [
									'loading',
									'Saving command $state...'
								];
								$state.togglingStates = $state.togglingStates;
								await toggleCommand(commandConfig?.command, v);
								commandConfig.disabled = !v;
								$state.togglingStates[`cmd/${$state.openModule}/toggle`] = [
									'success',
									v ? 'Successfully enabled command' : 'Successfully disabled command'
								];
								$state.togglingStates = $state.togglingStates;
							}}
						/>

						{#if $state.togglingStates[`cmd/${commandConfig?.command}/toggle`]}
							<Message type={$state.togglingStates[`cmd/${commandConfig?.command}/toggle`][0]}>
								{$state.togglingStates[`cmd/${commandConfig?.command}/toggle`][1]}
							</Message>
						{/if}

						<ButtonReact
							color={Color.Themable}
							icon="mdi:edit"
							text="Manage..."
							onClick={async () => {
								let found = false;
								for (let cmd of $cmdDataTable) {
									if (getCommandName(cmd) == commandConfig.command) {
										$state.commandEditorOpen = false;
										$state.commandEditOpen = cmd;
										$state.commandEditorOpen = true;
										found = true;
										break;
									}
								}

								return found;
							}}
							states={{
								loading: 'Loading...',
								error: 'Failed to load command configurations',
								success: 'Successfully loaded command configurations'
							}}
						/>
					</details>
				</li>
			{/each}
		</ul>
	</Modal>
{/if}

<style>
	table {
		color: white;
		margin: 0 !important;
	}
	tbody td {
		border: 1px solid #f5f5f5;
		padding: 4px 20px;
	}
	tbody tr {
		transition: all, 0.2s;
	}
	tbody tr:hover {
		background: #252323;
	}
</style>
