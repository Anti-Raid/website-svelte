<script lang="ts">
	import { makeSharedRequest, opGetBotState } from '$lib/fetch/ext';
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
	import Debug from './Debug.svelte';
	import { CanonicalCommand } from '@lib/generated/silverpelt';
	import { BotState } from '@lib/generated/types';

	interface State {
		commandSearch: string;
		botState: BotState | null;
		searchedCommands: CanonicalCommand[];
	}

	let state: State = {
		commandSearch: '',
		botState: null,
		searchedCommands: []
	};

	const fetchBotState = async () => {
		logger.info('FetchBotState', 'Fetching bot state');
		state.botState = await makeSharedRequest(opGetBotState());
		state.botState.commands = parseCommands(state.botState.commands);
		return state.botState;
	};

	const parseCommands = (commands: CanonicalCommand[], base?: string): CanonicalCommand[] => {
		let parsedCommands: CanonicalCommand[] = [];

		for (let command of commands) {
			if (command.subcommands.length > 0) {
				parsedCommands.push(...parseCommands(command.subcommands, command.name));
			} else {
				parsedCommands.push({
					...command,
					qualified_name: base ? `${base} ${command.name}` : command.name
				});
			}
		}

		return parsedCommands;
	};

	$: if (state?.commandSearch && state.botState) {
		state.searchedCommands = state.botState.commands.filter((cmd) =>
			cmd.qualified_name.toLowerCase().includes(state.commandSearch.toLowerCase())
		);
	}

	let cmdDataTable: Readable<CanonicalCommand[]>;

	const createCmdDataTable = async () => {
		const handler = new DataHandler(state.botState?.commands || [], { rowsPerPage: 20 });
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

<ul class="mt-4">
	{#each state.searchedCommands as searchedCommand}
		<li class="search-command mb-7">
			<h3 class="text-xl font-bold">{searchedCommand?.qualified_name}</h3>

			{#if searchedCommand?.description}
				<p class="text-slate-200">{searchedCommand?.description}</p>
			{/if}
		</li>
	{/each}
</ul>

<article class="command-list-article overflow-x-auto overflow-y-hidden h-full">
	<section class="mt-5 command-list flex flex-grow">
		{#await fetchBotState()}
			<Message type="loading">Loading bot state...</Message>
		{:then botState}
			{#await createCmdDataTable()}
				<Message type="loading">Loading commands...</Message>
			{:then data}
				<div class="overflow-x-auto space-y-4">
					<!-- Header -->
					<header class="flex justify-between gap-4">
						<Search handler={data.handler} />
						<RowsPerPage handler={data.handler} />
					</header>

					<!-- Table -->
					<table class="table table-hover table-compact bg-surface-600 w-full table-auto">
						<thead>
							<tr class="bg-surface-800">
								<ThSort handler={data.handler} orderBy={'qualified_name'}>Name</ThSort>
								<ThSort handler={data.handler} orderBy={'description'}>Description</ThSort>
								<ThSort handler={data.handler} orderBy={'arguments'}>Arguments</ThSort>
								<ThSort handler={data.handler} orderBy={'command_permissions'}>Permissions</ThSort>
							</tr>
							<tr class="bg-surface-800">
								<ThFilter handler={data.handler} filterBy={'qualified_name'} what="Name" />
								<ThFilter handler={data.handler} filterBy={'description'} what="Description" />
								<ThFilter handler={data.handler} filterBy={'arguments'} what="Arguments" />
								<ThFilter
									handler={data.handler}
									filterBy={'command_permissions'}
									what="Permissions"
								/>
							</tr>
						</thead>

						<tbody class="bg-surface-500 text-white">
							{#each $cmdDataTable as row}
								<tr>
									<td>
										{#if !row.qualified_name.includes(' ')}
											<span class="font-semibold">
												{row.name}
											</span>
										{:else}
											<span class="whitespace-nowrap">
												<span class="font-semibold">{row?.qualified_name?.split(' ')[0]}</span
												>{' '}<em
													>{row?.qualified_name?.replace(
														row?.qualified_name?.split(' ')[0] + ' ',
														''
													)}</em
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
											{#each botState.command_permissions[row.qualified_name] as permDesc}
												<li class="mb-2">
													<span class="font-semibold">{permDesc}</span>
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
		{:catch}
			<Message type="error">Failed to load modules</Message>
		{/await}
	</section>

	<Debug data={state} />
</article>
