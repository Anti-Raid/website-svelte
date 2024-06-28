<script lang="ts">
	import { CanonicalModule, GuildCommandConfiguration } from '$lib/generated/silverpelt';
	import {
		extractCommandsFromModule,
		getCommandConfigurations,
		ParsedCanonicalCommandData
	} from '$lib/ui/commands';
	import { DataHandler } from '@vincjo/datatables';
	import { Readable } from 'svelte/store';
	import Message from '../../../../components/Message.svelte';
	import Search from '../../../../components/common/datatable/Search.svelte';
	import RowsPerPage from '../../../../components/common/datatable/RowsPerPage.svelte';
	import ThSort from '../../../../components/common/datatable/ThSort.svelte';
	import ThFilter from '../../../../components/common/datatable/ThFilter.svelte';
	import RowCount from '../../../../components/common/datatable/RowCount.svelte';
	import Pagination from '../../../../components/common/datatable/Pagination.svelte';
	import logger from '$lib/ui/logger';
	import CommandModal from './CommandModal.svelte';

	export let moduleId: string;
	export let clusterModules: Record<string, CanonicalModule>;
	export let currentCommandConfiguration: GuildCommandConfiguration[];
	export let guildId: string;

	let commands: ParsedCanonicalCommandData[] = extractCommandsFromModule(clusterModules[moduleId]);
	$: moduleId, (commands = extractCommandsFromModule(clusterModules[moduleId]));

	let cmdDataTable: Readable<ParsedCanonicalCommandData[]>;
	const createCmdDataTable = async (commands: ParsedCanonicalCommandData[]) => {
		const handler = new DataHandler(commands, { rowsPerPage: 20 });

		cmdDataTable = handler.getRows();

		return {
			handler,
			rows: cmdDataTable
		};
	};

	let currentOpenCommand: ParsedCanonicalCommandData | undefined;
	let configsBeingEditted: GuildCommandConfiguration[];
	let isOpen: boolean;
</script>

{#await createCmdDataTable(commands)}
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
											<span class="font-semibold">{arg.name}</span>{#if arg.required}<span
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
									currentOpenCommand = row;
									configsBeingEditted = getCommandConfigurations(
										clusterModules,
										currentCommandConfiguration,
										guildId,
										row.full_name
									);
									logger.info(
										'CommandTab',
										'Editing command',
										currentOpenCommand,
										configsBeingEditted
									);
									isOpen = true;
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

{#if isOpen && currentOpenCommand}
	<CommandModal
		{guildId}
		{moduleId}
		{clusterModules}
		{commands}
		{currentOpenCommand}
		{configsBeingEditted}
		allCurrentCommandConfigurations={currentCommandConfiguration}
		bind:isOpen
	/>
{/if}

<style>
	tbody tr:hover {
		background: #252323;
	}
</style>
