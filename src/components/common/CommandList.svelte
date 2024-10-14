<script lang="ts">
	import { makeSharedRequest, opGetModules } from '$lib/fetch/ext';
	import { CanonicalModule } from '$lib/generated/silverpelt';
	import logger from '$lib/ui/logger';
	import Message from '../Message.svelte';
	import NavButton from '../inputs/button/NavButton.svelte';
	import InputText from '../inputs/InputText.svelte';
	import { DataHandler } from '@vincjo/datatables';
	import { Readable } from 'svelte/store';
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
	import NoticeArea from './noticearea/NoticeArea.svelte';
	import Debug from './Debug.svelte';

	interface State {
		openModule: string;
		commandSearch: string;
		moduleData: Record<string, CanonicalModule>;
		searchedCommands: LookedUpCommand[];
	}

	let state: State = {
		openModule: 'core',
		moduleData: {},
		commandSearch: '',
		searchedCommands: []
	};

	const fetchModules = async () => {
		logger.info('FetchModules', 'Fetching modules');
		state.moduleData = await makeSharedRequest(opGetModules());
		return state.moduleData;
	};

	$: if (state?.commandSearch) {
		state.searchedCommands = commandLookup(state.moduleData, state.commandSearch);
	} else {
		state.searchedCommands = [];
	}

	let cmdDataTable: Readable<ParsedCanonicalCommandData[]>;

	const createCmdDataTable = async (_: string) => {
		let module = state.moduleData[state.openModule];

		let commands: ParsedCanonicalCommandData[] = extractCommandsFromModule(module);

		const handler = new DataHandler(commands, { rowsPerPage: 20 });
		cmdDataTable = handler.getRows();

		return {
			handler,
			rows: cmdDataTable
		};
	};
</script>

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

<article class="command-list-article overflow-x-auto overflow-y-hidden h-full">
	<section class="mt-5 command-list flex flex-grow">
		{#await fetchModules()}
			<Message type="loading">Loading modules...</Message>
		{:then modules}
			<ul class="mt-4">
				{#each state.searchedCommands as searchedCommand}
					<li class="search-command mb-7">
						<h3 class="text-xl font-bold">{searchedCommand?.command?.full_name}</h3>

						{#if searchedCommand?.command?.description}
							<p class="text-slate-200">{searchedCommand?.command?.description}</p>
						{/if}

						<p class="text-slate-200"><strong>Module:</strong> {searchedCommand?.module?.name}</p>
					</li>
				{/each}
			</ul>

			<!--Module list-->
			<section class="module-list flex flex-grow">
				<!--Bar-->
				<nav class="module-map flex-none border-r border-slate-500 w-40">
					{#each Object.entries(modules) as [_, module]}
						{#if !module?.web_hidden}
							<NavButton
								current={state.openModule == module?.id}
								title={module?.name}
								onClick={() => {
									state.openModule = module?.id || modules['core'].id;
								}}
								extClass="block mb-2 w-full rounded-l-full  font-semibold font-cabin text-sm"
							/>
						{/if}
					{/each}
				</nav>

				<!--Content-->
				<div class="module-list-content flex-1 flex-grow px-2 mb-auto">
					{#if state.openModule}
						<h1 class="text-2xl font-semibold leading-6 text-white font-monster">
							{modules[state?.openModule]?.name}
						</h1>
						<p class="text-slate-200 text-base font-semibold font-cabin">
							{modules[state?.openModule]?.description}
						</p>

						<div class="pt-2" />

						{#if modules[state?.openModule].is_default_enabled}
							<p class="text-green-500 font-semibold font-cabin">
								This module is enabled by default!
							</p>
						{/if}

						<p
							class="text-{modules[state?.openModule].toggleable
								? 'green'
								: 'red'}-500 font-semibold font-cabin"
						>
							{modules[state?.openModule].toggleable
								? 'This module is toggleable.'
								: 'This module is NOT toggleable.'}
						</p>

						{#if modules[state?.openModule].web_hidden}
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
									<Search handler={data.handler} category={modules[state?.openModule]?.name} />
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

									<tbody class="bg-surface-500 text-white">
										{#each $cmdDataTable as row}
											<tr>
												<td>
													{#if row.subcommand_depth == 0}
														<span class="font-semibold">
															{row.name}
														</span>
													{:else}
														<span class="whitespace-nowrap">
															<span class="font-semibold">{row?.parent_command?.name}</span>{' '}<em
																>{row.name}</em
															>
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
													<span>
														{#if row.description}
															{row.description}
														{:else}
															Mystery Box?
														{/if}
													</span>
												</td>
												<td>
													<span>
														<ul class="list-disc list-outside text-white">
															{#each row.arguments as arg, i}
																<li class={i + 1 < row.arguments.length ? 'mb-2' : ''}>
																	<span class="font-semibold">{arg.name}</span>

																	{#if arg.required}
																		<span class="text-red-400 font-semibold">*</span>
																	{/if}

																	{#if arg.description}
																		<span>: </span><em>{arg.description}</em>
																	{/if}
																</li>
															{/each}
														</ul>
													</span>
												</td>
												<td>
													<ul class="list-disc list-outside text-white">
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
		{:catch}
			<Message type="error">Failed to load modules</Message>
		{/await}
	</section>

	<Debug data={state} />
</article>
