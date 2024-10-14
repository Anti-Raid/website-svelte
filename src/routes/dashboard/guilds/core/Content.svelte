<script lang="ts">
	import {
		CanonicalModule,
		FullGuildCommandConfiguration,
		GuildModuleConfiguration
	} from '$lib/generated/silverpelt';
	import { UserGuildBaseData } from '$lib/generated/types';
	import TabbedPane from '../../../../components/inputs/button/tabs/TabbedPane.svelte';
	import ModuleInfoTab from '../tab:moduleinfo/ModuleInfoTab.svelte';
	import CommandTab from '../tab:commands/CommandTab.svelte';
	import { CommonPermissionContext } from '../../../../components/dashboard/permissions/commonPermissionContext';
	import SettingsTab from '../tab:settings/SettingsTab.svelte';
	import { State } from './types';
	import BoxButton from '../../../../components/inputs/button/BoxButton.svelte';
	import InputText from '../../../../components/inputs/InputText.svelte';
	import { commandLookup } from '$lib/ui/commands';
	import { defaultComponent, quickActions } from '../quickactions/actions';
	import Message from '../../../../components/Message.svelte';
	import SleekButton from '../../../../components/inputs/button/SleekButton.svelte';

	export let modules: Record<string, CanonicalModule>;
	export let commonPermissionContext: CommonPermissionContext;
	export let guildId: string;
	export let currentModuleConfiguration: GuildModuleConfiguration[];
	export let currentCommandConfiguration: FullGuildCommandConfiguration[];
	export let guildData: UserGuildBaseData;

	export let state: State;

	const _setState = (newState: State) => {
		state = newState;
	};
</script>

{#if state.openedEntity.indexPage}
	<div class="index-page ml-2 px-2 mb-auto mx-auto">
		<h1 class="text-2xl font-semibold">Welcome!</h1>
		<p class="text-slate-200">
			Using the dashboard, you can control almost all aspects of AntiRaid and its operation on your
			server!
		</p>

		<h2 class="mt-5 text-xl font-semibold">Quick Actions</h2>

		<p class="text-slate-200">
			On the left of the screen, you will be able to see a list of "Quick Actions". These tabs
			provide simplified UIs for the most common functionality used by most servers.
		</p>

		<div class="mb-2" />

		<div class="col-span-8 grid grid-cols-1 gap-6 lg:grid-cols-2 h-full">
			{#each quickActions as action}
				<SleekButton
					onclick={() => {
						state.openedEntity = { quickAction: { id: action.id } };
					}}
					icon={action.icon}
					name={action.name}
					description={action.description}
				/>
			{/each}
		</div>

		<h2 class="mt-5 text-xl font-semibold">Modules</h2>

		<p class="text-slate-200">
			On the left of the screen are modules that together make up the core of AntiRaid. As a server
			manager, you can use the modules system to enable/disable the module and all events/commands
			pertaining to it as well as delegate default permissions for commands within a module for
			macro level control.
		</p>

		<div class="mb-2" />

		<div class="col-span-8 grid grid-cols-1 gap-6 lg:grid-cols-3 h-full">
			{#each Object.values(modules) as _module}
				<SleekButton
					onclick={() => {
						state.openedEntity = { module: { id: _module.id, tab: 'moduleInfo' } };
					}}
					icon="bx:book"
					name={_module.name}
					description={_module.description}
				/>
			{/each}
		</div>

		<h2 class="mt-5 text-xl font-semibold">Command Searcher</h2>
		<p class="text-slate-200">
			Looking for a specific command? Or did you forget which module it's in? No biggie, just type
			it in below!
		</p>

		<div class="p-3" />

		<InputText
			id="command-search-bar"
			label="Command Lookup"
			placeholder="Search for a command"
			minlength={0}
			showErrors={false}
			extClass=" rounded-r-full"
			bind:value={state.commandSearch}
		/>

		<ul>
			{#each commandLookup(modules, state.commandSearch) as searchedCommand}
				<li class="search-command mb-7">
					<h3 class="text-xl font-bold">{searchedCommand?.command?.full_name}</h3>
					{#if searchedCommand?.command?.description}
						<p class="text-slate-200">{searchedCommand?.command?.description}</p>
					{/if}
					<p class="text-slate-200"><strong>Module:</strong> {searchedCommand?.module?.name}</p>
				</li>
			{/each}
		</ul>
	</div>
{:else if state.openedEntity.module}
	<div class="module ml-2 px-2 mb-auto mx-auto">
		<h1 class="text-2xl font-semibold">
			{modules[state.openedEntity.module.id]?.name}
		</h1>
		<p class="text-slate-200">
			{modules[state.openedEntity.module.id]?.description}
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
				module={modules[state.openedEntity.module.id]}
				{commonPermissionContext}
				bind:currentModuleConfiguration
			/>
		{:else if state.openedEntity.module.tab == 'cmdList'}
			<CommandTab
				{guildId}
				moduleId={state.openedEntity.module.id}
				{modules}
				{commonPermissionContext}
				bind:currentCommandConfiguration
			/>
		{:else if state.openedEntity.module.tab == 'settings'}
			<SettingsTab {guildId} module={modules[state.openedEntity.module.id]} {guildData} {modules} />
		{/if}
	</div>
{:else if state.openedEntity.quickAction}
	{#await quickActions
		.find((a) => a.id == state.openedEntity.quickAction?.id)
		?.component() || defaultComponent()}
		<div class="p-4">
			<Message type="loading">Loading quick action</Message>
		</div>
	{:then module}
		<svelte:component
			this={module}
			props={{
				modules,
				commonPermissionContext,
				guildId,
				currentModuleConfiguration,
				currentCommandConfiguration,
				guildData,
				setState: _setState
			}}
			{state}
		/>
	{/await}
{/if}
