<script lang="ts">
	import {
		CanonicalModule,
		FullGuildCommandConfiguration,
		GuildModuleConfiguration
	} from '$lib/generated/silverpelt';
	import { UserGuildBaseData } from '$lib/generated/types';
	import { CommonPermissionContext } from '@components/dashboard/permissions/commonPermissionContext';
	import { openedEntityToString, State } from './types';
	import Icon from '@iconify/svelte';
	import Debug from '@components/common/Debug.svelte';
	import Message from '@components/Message.svelte';
	import Module from './Module.svelte';
	import { defaultComponent, quickActions } from '../quickactions/actions';
	import SleekButton from '@components/inputs/button/SleekButton.svelte';
	import InputText from '@components/inputs/InputText.svelte';
	import { commandLookup } from '@lib/ui/commands';
	import BoxButton from '@components/inputs/button/BoxButton.svelte';

	export let modules: Record<string, CanonicalModule>;
	export let commonPermissionContext: CommonPermissionContext;
	export let guildId: string;
	export let currentModuleConfiguration: GuildModuleConfiguration[];
	export let currentCommandConfiguration: FullGuildCommandConfiguration[];
	export let guildData: UserGuildBaseData;
	export let state: State;

	const setIn = () => {
		let currentUrl = new URL(window.location.href);

		let inQuery = openedEntityToString(state.openedEntity);

		if (inQuery) {
			currentUrl.searchParams.set('in', inQuery);
			history.pushState({}, '', currentUrl);
		} else {
			currentUrl.searchParams.delete('in');
			history.pushState({}, '', currentUrl);
		}
	};

	$: state.openedEntity, setIn();

	const _setState = (newState: State) => {
		state = newState;
	};
</script>

<!--Content-->
<section class="content col-span-1 md:col-span-4">
	<section class="guild-basic-details ml-2 px-2 mb-auto mx-auto">
		<!--Avatar-->
		<img
			loading="lazy"
			src={guildData.icon}
			class="h-8 m-0 align-middle inline rounded-full"
			alt="{guildData.name}'s avatar"
		/>
		<!--Guild Name-->
		<span class="ml-1 font-monster font-bold tracking-tight align-middle m-0">{guildData.name}</span
		>
	</section>

	{#if state.openedEntity.module}
		<div class="module ml-2 px-2 mb-auto mx-auto">
			<!--Back Button-->
			<BoxButton
				onClick={() => {
					state.openedEntity = { indexPage: true };
				}}
			>
				<Icon icon="ant-design:arrow-left-outlined" class="text-2xl text-white" />
				Back Home
			</BoxButton>

			<h1 class="text-2xl font-semibold">
				{modules[state.openedEntity.module.id]?.name}
			</h1>
			<p class="text-slate-200">
				{modules[state.openedEntity.module.id]?.description}
			</p>

			<Module
				{guildId}
				module={modules[state.openedEntity.module.id]
					? modules[state.openedEntity.module.id]
					: modules['core']}
				{commonPermissionContext}
				{modules}
				{guildData}
				bind:currentCommandConfiguration
				bind:currentModuleConfiguration
			/>
		</div>
	{:else if state.openedEntity.quickAction}
		<!--Back Button-->
		<BoxButton
			onClick={() => {
				state.openedEntity = { indexPage: true };
			}}
		>
			<Icon icon="ant-design:arrow-left-outlined" class="text-2xl text-white" />
			Back Home
		</BoxButton>

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
	{:else}
		<div class="index-page ml-2 px-2 mb-auto mx-auto">
			<h1 class="text-2xl font-semibold">Welcome!</h1>
			<p class="text-slate-200">
				Using the dashboard, you can control almost all aspects of AntiRaid and its operation on
				your server!
			</p>

			<h2 class="mt-5 text-xl font-semibold">Modules</h2>

			<p class="text-slate-200">
				As a server manager, you can not only individually enable/disable modules and their
				commands, you can also mandate the exact required permissions.<br /><br />

				<span class="font-monster text-lg">
					Want something beyond the core modules. Check out
					<a
						class="text-primary-300 hover:text-primary-500"
						href="https://docs.antiraid.xyz/user/templating/1-intro"
						target="_blank">Templating</a
					>, the official way to extend AntiRaid to meet your needs!
				</span>
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
	{/if}
</section>

<Debug data={state} />
