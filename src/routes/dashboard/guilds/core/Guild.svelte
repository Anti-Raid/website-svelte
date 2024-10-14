<script lang="ts">
	import {
		CanonicalModule,
		FullGuildCommandConfiguration,
		GuildModuleConfiguration
	} from '$lib/generated/silverpelt';
	import NavButton from '../../../../components/inputs/button/NavButton.svelte';
	import { UserGuildBaseData } from '$lib/generated/types';
	import { CommonPermissionContext } from '../../../../components/dashboard/permissions/commonPermissionContext';
	import { openedEntityToString, State } from './types';
	import Content from './Content.svelte';
	import Icon from '@iconify/svelte';
	import { quickActions } from '../quickactions/actions';
	import Debug from '../../../../components/common/Debug.svelte';

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
</script>

<!--Menu at the right of the page-->
<article class="guild-menu grid grid-cols-1 md:gap-1 md:grid-cols-5 md:grid-flow-dense">
	<!--Search bar-->

	<!--Module list-->
	<!--Bar-->
	<nav
		class={state.openedEntity.mobileSidebar
			? 'nav md:col-span-1 block w-full mt-1 border border-gray-600 p-2 border-solid rounded-sm'
			: 'nav md:col-span-1 hidden md:block w-full mt-1 border border-gray-600 p-2 border-solid rounded-sm'}
	>
		<section class="guild-basic-details">
			<!--Avatar-->
			<img
				loading="lazy"
				src={guildData.icon}
				class="h-8 m-0 align-middle inline rounded-full"
				alt="{guildData.name}'s avatar"
			/>
			<!--Guild Name-->
			<span class="ml-1 font-monster font-bold tracking-tight align-middle m-0"
				>{guildData.name}</span
			>
		</section>

		<NavButton
			current={!!state.openedEntity.indexPage}
			title={'⌂ Home'}
			onClick={() => {
				state.openedEntity = { indexPage: {} };
			}}
			extClass="block rounded-l-md rounded-r-full mt-3 mb-2 font-cabin font-semibold w-full"
		/>

		<details id="quick-actions-pane" class="summary-expand-close-right" open>
			<summary class="hover:cursor-pointer font-semibold">Quick Actions</summary>

			{#each quickActions as action}
				<NavButton
					current={state.openedEntity.quickAction?.id == action.id}
					title={action.name}
					onClick={() => {
						state.openedEntity = { quickAction: { id: action.id } };
					}}
					extClass="block rounded-l-md rounded-r-full mb-2 font-cabin font-semibold w-full"
				/>
			{/each}
		</details>

		<details id="modules-pane" class="summary-expand-close-right" open>
			<summary class="hover:cursor-pointer font-semibold">Modules</summary>

			{#each Object.entries(modules) as [_, module]}
				<NavButton
					current={state.openedEntity?.module?.id == module?.id}
					title={module?.name}
					onClick={() => {
						state.openedEntity = { module: { id: module?.id, tab: 'moduleInfo' } };
					}}
					extClass="block rounded-l-md rounded-r-full mb-2 font-cabin font-semibold w-full"
				/>
			{/each}
		</details>
	</nav>

	<!--Content-->
	<section
		class={(!state.openedEntity.mobileSidebar ? 'block ' : 'hidden md:block ') +
			'content col-span-1 md:col-span-4'}
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
			{modules}
			{commonPermissionContext}
			{guildId}
			{currentModuleConfiguration}
			{currentCommandConfiguration}
			{guildData}
			bind:state
		/>
	</section>
</article>

<Debug data={state} />

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
