<script lang="ts">
	import {
		CanonicalModule,
		FullGuildCommandConfiguration,
		GuildModuleConfiguration
	} from '$lib/generated/silverpelt';
	import NavButton from '../../../../components/inputs/button/NavButton.svelte';
	import { UserGuildBaseData } from '$lib/generated/types';
	import { CommonPermissionContext } from '../../../../components/dashboard/permissions/commonPermissionContext';
	import { InstanceList } from '$lib/generated/mewld/proc';
	import { State } from './types';
	import Content from './Content.svelte';
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

	let state: State = {
		openedEntity: { indexPage: {} },
		commandSearch: '',
		searchedCommands: [],
		commandEditorOpen: false,
		commandEditConfigs: [],
		clusterFinderByGuildIdExpectedData: null
	};
</script>

<!--Cluster Menu at the right of the page-->
<article class="guild-menu md:grid md:gap-1 md:grid-cols-5 md:grid-flow-dense">
	<!--Search bar-->

	<!--Module list-->
	<!--Bar-->
	<nav
		class={'nav md:col-span-1 hidden md:block flex-none w-full mt-1 border border-gray-600 p-2 border-solid rounded-sm'}
	>
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

		<details id="quick-actions-pane" class="summary-expand-close-right" open>
			<summary class="hover:cursor-pointer font-semibold">Quick Actions</summary>

			<NavButton
				current={state.openedEntity.quickAction?.id == 'welcome-messages'}
				title={'Welcome Messages'}
				onClick={() => {
					state.openedEntity = { quickAction: { id: 'welcome-messages' } };
				}}
				extClass="block mb-2 w-full"
			/>
		</details>

		<details id="modules-pane" class="summary-expand-close-right" open>
			<summary class="hover:cursor-pointer font-semibold">Modules</summary>

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
		</details>
	</nav>

	<!--Content-->
	<section
		class={(!state.openedEntity.mobileSidebar ? 'block ' : 'hidden md:block ') +
			'content col-span-4'}
	>
		<div class="menu-area block md:hidden text-white">
			<button
				class="float-right hover:opacity-80 sticky top-0 right-0"
				title="Sidebar"
				on:click|preventDefault={() => {
					state.openedEntity = { mobileSidebar: {} };
				}}
			>
				<span class="sr-only">Open Sidebar</span>
				<Icon icon="bx:bx-menu" class="inline-block text-2xl m-auto" />
			</button>
		</div>

		<Content
			{clusterModules}
			{commonPermissionContext}
			{guildId}
			{instanceList}
			{currentModuleConfiguration}
			{currentCommandConfiguration}
			{guildData}
			{guildClusterId}
			{guildShardId}
			bind:state
		/>
	</section>
</article>

<details>
	<summary class="hover:cursor-pointer">Debug</summary>
	<pre>{JSON.stringify(state, null, 4)}</pre>
</details>

<style>
	details.summary-expand-close-right > summary {
		list-style: none;
	}
	details.summary-expand-close-right summary::-webkit-details-marker {
		display: none;
		font-size: 32px;
	}

	details.summary-expand-close-right summary::after {
		content: ' +';
		opacity: 80%;
		vertical-align: top;
	}

	details.summary-expand-close-right[open] summary:after {
		content: ' -';
	}
</style>
