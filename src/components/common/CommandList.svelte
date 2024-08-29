<script lang="ts">
	import { makeSharedRequest, opGetClusterModules } from '$lib/fetch/ext';
	import { InstanceList } from '$lib/generated/mewld/proc';
	import { CanonicalModule } from '$lib/generated/silverpelt';
	import logger from '$lib/ui/logger';
	import Message from '../Message.svelte';
	import Modal from '../Modal.svelte';
	import NavButton from '../inputs/button/NavButton.svelte';
	import ButtonReact from '../inputs/button/ButtonReact.svelte';
	import InputText from '../inputs/InputText.svelte';
	import GuildClusterLookup from './GuildClusterLookup.svelte';
	import { Color } from '../inputs/button/colors';
	import { DataHandler } from '@vincjo/datatables';
	import { Readable } from 'svelte/store';
	import BoolInput from '../inputs/BoolInput.svelte';
	import Pagination from './datatable/Pagination.svelte';
	import RowCount from './datatable/RowCount.svelte';
	import RowsPerPage from './datatable/RowsPerPage.svelte';
	import Search from './datatable/Search.svelte';
	import ThFilter from './datatable/ThFilter.svelte';
	import ThSort from './datatable/ThSort.svelte';
	import {
		LookedUpCommand,
		ParsedCanonicalCommandData,
		commandLookup,
		extractCommandsFromModule
	} from '$lib/ui/commands';
	import { NoticeProps } from './noticearea/noticearea';
	import NoticeArea from './noticearea/NoticeArea.svelte';
	import Debug from './Debug.svelte';

	export let instanceList: InstanceList;

	interface State {
		openCluster: number;
		openModule: string;
		commandSearch: string;
		clusterModuleData: Record<number, Record<string, CanonicalModule>>;
		searchedCommands: LookedUpCommand[];
		clusterFinderOpen: boolean;
		clusterFinderNoticeArea: NoticeProps | null;
		clusterFinderByGuildIdExpectedData: {
			cluster: number;
			shard: number;
		} | null;
	}

	let state: State = {
		openCluster: 0,
		openModule: 'core',
		clusterModuleData: {},
		commandSearch: '',
		searchedCommands: [],
		clusterFinderOpen: false,
		clusterFinderByGuildIdExpectedData: null,
		clusterFinderNoticeArea: null
	};

	const fetchCluster = async (_: number | undefined) => {
		logger.info('FetchCluster', 'Fetching cluster modules', state?.openCluster);
		let resp = await makeSharedRequest(opGetClusterModules(state?.openCluster));
		// Save resp to state
		if (!state.clusterModuleData[state?.openCluster || 0])
			state.clusterModuleData[state?.openCluster || 0] = resp;
	};

	$: if (state?.commandSearch && state.clusterModuleData[state.openCluster]) {
		state.searchedCommands = commandLookup(
			state.clusterModuleData[state.openCluster],
			state.commandSearch
		);
	} else {
		state.searchedCommands = [];
	}

	let cmdDataTable: Readable<ParsedCanonicalCommandData[]>;

	const createCmdDataTable = async (_: string) => {
		let module = state.clusterModuleData[state.openCluster][state.openModule];

		let commands: ParsedCanonicalCommandData[] = extractCommandsFromModule(module);

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
	<section class="mt-5 command-list flex flex-grow">
		<nav class="cluster-map flex-none border-r border-slate-500 w-28">
			{#each instanceList?.Instances as instance}
				<NavButton
					current={state.openCluster == instance?.ClusterID}
					title={`${instanceList?.Map?.find((cluster) => cluster.ID == instance?.ClusterID)?.Name}`}
					onClick={() => {
						state.openCluster = instance?.ClusterID || 0;
					}}
					extClass="block mb-2 w-full rounded-l-full rounded-r-none font-semibold font-cabin text-md"
				/>
			{/each}

			<NavButton
				current={false}
				title={`⚠️ Help`}
				onClick={() => {
					state.clusterFinderOpen = true;
					state.clusterFinderByGuildIdExpectedData = null;
				}}
				extClass="block mb-2 w-full rounded-l-full rounded-r-none font-semibold font-cabin text-md"
			/>
		</nav>

		<div class="cluster-map-content flex-1 flex-grow px-2">
			{#if !state.clusterModuleData[state?.openCluster]}
				{#await fetchCluster(state?.openCluster)}
					<Message type="loading">Loading cluster modules...</Message>
				{:catch}
					<Message type="error">Failed to load cluster modules</Message>
				{/await}
			{:else}
				<!--Search bar-->
				<InputText
					id="command-search-bar"
					label="Command Lookup"
					placeholder="Search for a command."
					minlength={0}
					showErrors={false}
					extClass="rounded-l-full rounded-r-md"
					bind:value={state.commandSearch}
				/>

				<ul class="mt-4">
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
					<nav class="cluster-map flex-none border-r border-slate-500 w-40">
						{#each Object.entries(state.clusterModuleData[state?.openCluster]) as [_, module]}
							{#if !module?.web_hidden}
								<NavButton
									current={state.openModule == module?.id}
									title={module?.name}
									onClick={() => {
										state.openModule =
											module?.id || state.clusterModuleData[state?.openCluster]['core'].id;
									}}
									extClass="block mb-2 w-full rounded-l-full rounded-r-none font-semibold font-cabin text-sm"
								/>
							{/if}
						{/each}
					</nav>

					<!--Content-->
					<div class="cluster-module-list-content flex-1 flex-grow px-2 mb-auto">
						{#if state.openModule}
							<h1 class="text-2xl font-semibold leading-6 font-monster">
								{state.clusterModuleData[state?.openCluster][state?.openModule]?.name}
							</h1>
							<p class="text-slate-200 text-base font-semibold font-cabin">
								{state.clusterModuleData[state?.openCluster][state?.openModule]?.description}
							</p>

							<div class="pt-2" />

							{#if state.clusterModuleData[state?.openCluster][state?.openModule].is_default_enabled}
								<p class="text-green-500 font-semibold font-cabin">
									This module is enabled by default!
								</p>
							{/if}

							<p
								class="text-{state.clusterModuleData[state?.openCluster][state?.openModule]
									.toggleable
									? 'green'
									: 'red'}-500 font-semibold font-cabin"
							>
								{state.clusterModuleData[state?.openCluster][state?.openModule].toggleable
									? 'This module is toggleable.'
									: 'This module is NOT toggleable.'}
							</p>

							{#if state.clusterModuleData[state?.openCluster][state?.openModule].web_hidden}
								<p class="text-red-500 font-semibold font-cabin mt-2">
									Sorry, this module is not supported with our website/dashboard yet!
								</p>
							{/if}

							<div class="pt-2" />

							{#await createCmdDataTable(state?.openModule)}
								<Message type="loading">Loading commands...</Message>
							{:then data}
								<div class="overflow-x-auto space-y-4">
									<!-- Header -->
									<header class="flex justify-between gap-4">
										<Search
											handler={data.handler}
											category={state.clusterModuleData[state?.openCluster][state?.openModule]
												?.name}
										/>
										<RowsPerPage handler={data.handler} />
									</header>

									<!-- Table -->
									<table class="table table-hover table-compact bg-surface-600 w-full table-auto">
										<thead>
											<tr class="bg-surface-800">
												<ThSort handler={data.handler} orderBy={'full_name'}>Name</ThSort>
												<ThSort handler={data.handler} orderBy={'description'}>Description</ThSort>
												<ThSort handler={data.handler} orderBy={'arguments'}>Arguments</ThSort>
												<ThSort handler={data.handler} orderBy={'search_permissions'}
													>Permissions</ThSort
												>
											</tr>
											<tr class="bg-surface-800">
												<ThFilter handler={data.handler} filterBy={'full_name'} what="Name" />
												<ThFilter
													handler={data.handler}
													filterBy={'description'}
													what="Description"
												/>
												<ThFilter handler={data.handler} filterBy={'arguments'} what="Arguments" />
												<ThFilter
													handler={data.handler}
													filterBy={'search_permissions'}
													what="Permissions"
												/>
											</tr>
										</thead>

										<tbody class="bg-surface-500">
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
														<ul class="list-disc list-outside">
															{#each row.extended_data?.default_perms?.Simple?.checks || [] as check}
																<li class="mr-2">
																	<pre class="command-parameter">{check.kittycat_perms}</pre>
																</li>
															{/each}
														</ul>
													</td>
												</tr>
											{/each}
										</tbody>
									</table>

									<!-- Footer -->
									<footer class="flex justify-between">
										<RowCount handler={data.handler} />
										<Pagination handler={data.handler} />
									</footer>
								</div>
							{:catch}
								<Message type="error">Failed to load commands</Message>
							{/await}
						{/if}
					</div>
				</section>
			{/if}
		</div>
	</section>

	<Debug data={state} />

	{#if state.clusterFinderOpen}
		<Modal title="Help" logo="/logo.webp" bind:showModal={state.clusterFinderOpen}>
			<h1 class="font-semibold text-xl">Server Lookup</h1>
			<p class="text-gray-300 font-semibold">
				If you're planning to add AntiRaid to a specific server, please enter the Server's ID below.
				You can find your Server's ID from either the <em>AntiRaid Dashboard</em> or by
				<em
					><a
						class="text-blue-400 hover:text-blue-600"
						href="https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID#:~:text=Obtaining%20Server%20IDs%20%2D%20Mobile%20App,name%20and%20select%20Copy%20ID."
						>following the steps outlined here!</a
					></em
				>
			</p>

			<div class="p-3" />

			<GuildClusterLookup
				{instanceList}
				bind:expectedInfo={state.clusterFinderByGuildIdExpectedData}
			/>

			{#if state.clusterFinderByGuildIdExpectedData}
				<ButtonReact
					color={Color.Themable}
					icon="mdi:forward"
					text="Take Me There!"
					onClick={async () => {
						if (!state.clusterFinderByGuildIdExpectedData) {
							throw new Error('No cluster data found');
						}
						state.openCluster = state.clusterFinderByGuildIdExpectedData.cluster;
						state.clusterFinderOpen = false;
					}}
					states={{
						loading: 'Loading...',
						error: 'Failed to find cluster',
						success: 'Found cluster!'
					}}
					bind:noticeProps={state.clusterFinderNoticeArea}
				/>

				{#if state.clusterFinderNoticeArea}
					<NoticeArea props={state.clusterFinderNoticeArea} />
				{/if}
			{/if}
		</Modal>
	{/if}
</article>
