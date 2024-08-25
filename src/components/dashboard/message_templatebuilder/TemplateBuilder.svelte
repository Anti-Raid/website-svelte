<script lang="ts">
	import { browser } from '$app/environment';
	import logger from '$lib/ui/logger';
	import { onDestroy, onMount } from 'svelte';
	import { NoticeProps } from '../../common/noticearea/noticearea';
	import NoticeArea from '../../common/noticearea/NoticeArea.svelte';
	import Modal from '../../Modal.svelte';
	import TabButton from '../../inputs/button/tabs/TabButton.svelte';
	import InputTextArea from '../../inputs/InputTextArea.svelte';
	import Label from '../../inputs/Label.svelte';
	import ButtonReact from '../../inputs/multi/Button.svelte';
	import DangerButton from '../../inputs/multi/DangerButton.svelte';
	import Spacer from '../../inputs/Spacer.svelte';
	import {
		defaultSnippets,
		generateTemplateForTemplateBuilderData,
		parseTemplateBuilderDataCommentFromTemplate
	} from './common';
	import TemplateBuilderEmbed from './TemplateBuilderEmbed.svelte';
	import { defaultData, TemplateBuilderData } from './types';
	import { title } from '$lib/strings';

	export let templateBuilderData: TemplateBuilderData = defaultData();
	export let rawTemplateOutput: string;

	const deleteEmbed = (i: number) => {
		templateBuilderData.embeds = templateBuilderData.embeds.filter((_, index) => index !== i);
	};

	const addEmbed = (i: number) => {
		templateBuilderData.embeds = [
			...templateBuilderData.embeds.slice(0, i + 1),
			{ title: '', description: '', fields: [] },
			...templateBuilderData.embeds.slice(i + 1)
		];
	};

	const setupInitialState = async () => {
		if (openTab) return;

		const getTabToUse = async (): Promise<string> => {
			logger.info(
				'TemplateBuilder#Message.setupInitialState',
				'rawTemplateOutput',
				rawTemplateOutput
			);

			if (!rawTemplateOutput) {
				return 'builder'; // Now we can default to builder
			} else {
				logger.info(
					'TemplateBuilder#Message.setupInitialState',
					'Checking for template builder comment',
					rawTemplateOutput
				);
				let templateBuilderComment = await parseTemplateBuilderDataCommentFromTemplate(
					rawTemplateOutput
				);

				if (!templateBuilderComment) {
					logger.warn(
						'TemplateBuilder#Message.setupInitialState',
						'No template builder comment found',
						rawTemplateOutput
					);
					return 'advanced'; // If we can't find the comment, we default to advanced as it is likely the user has removed the comment
				}

				rawTemplateOutput = templateBuilderComment.template;
				if (!templateBuilderComment.checksumOk) {
					noticeProps = {
						level: 'warn',
						text: "The template builder data has been modified since 'Message Builder' was used. Please use the advanced tab to edit the template."
					};
					return 'advanced'; // If the checksum is not ok, we default to advanced
				}

				templateBuilderData = templateBuilderComment.comment.data;
				return 'builder';
			}
		};

		let tab = await getTabToUse();

		logger.error('TemplateBuilder#Message.getTabToUse:', tab);

		openTab = tab;
	};

	let openTab: string;
	let noticeProps: NoticeProps | null = null;
	let switchTab: string | null = null;
	let showModal: boolean;

	$: setupInitialState();
	$: {
		if (openTab == 'builder' && templateBuilderData) {
			generateTemplateForTemplateBuilderData(templateBuilderData).then(
				(x) => (rawTemplateOutput = x)
			);
		}
	}
</script>

<TabButton
	visible={openTab == 'builder'}
	text={'Builder'}
	onClick={async () => {
		if (openTab == 'builder') return;

		if (rawTemplateOutput) {
			// Check if builder and raw output are the same (e.g. if someone editted something on advanced tab and then wants to switch back to builder)
			let template = await generateTemplateForTemplateBuilderData(templateBuilderData);

			if (template != rawTemplateOutput) {
				switchTab = 'builder';
				showModal = true;
			} else {
				openTab = 'builder';
				switchTab = null;
			}
		} else {
			openTab = 'builder';
			switchTab = null;
		}
	}}
/>

<TabButton
	visible={openTab == 'advanced'}
	text={'Advanced'}
	onClick={() => {
		openTab = 'advanced';
		switchTab = null;
	}}
/>

{#if switchTab}
	<Modal title="Unsaved Changes" bind:showModal logo="/logo.webp">
		<p>You have unsaved changes. Are you sure you want to switch tabs?</p>

		<ButtonReact
			onclick={() => {
				if (!switchTab) return;
				openTab = switchTab;
				switchTab = null;
				showModal = false;
			}}>Yes</ButtonReact
		>

		<ButtonReact
			onclick={() => {
				if (!switchTab) return;
				switchTab = null;
				showModal = false;
			}}>No</ButtonReact
		>
	</Modal>
{/if}

{#if noticeProps}
	<NoticeArea props={noticeProps} />
{/if}

{#if openTab == 'builder'}
	<Label id="embeds-list" label="Embeds" />
	<div id="embeds-list">
		{#each templateBuilderData.embeds as embed, i}
			<details
				id={`embed-${i}--details`}
				class="embed---details border p-2 bg-black hover:bg-slate-900"
				open={true}
			>
				<summary
					class="embed--summary hover:cursor-pointer font-semibold text-xl items-center align-middle justify-center"
				>
					{embed.title ? `Embed ${i}: ${embed.title}` : `Embed ${i}`}
				</summary>

				<TemplateBuilderEmbed bind:embed />

				<div>
					<DangerButton onclick={() => deleteEmbed(i)}>Delete Embed</DangerButton>
					<ButtonReact onclick={() => addEmbed(i)}>Add Embed</ButtonReact>
				</div>
			</details>
		{/each}
	</div>

	{#if templateBuilderData.embeds.length == 0}
		<ButtonReact onclick={() => addEmbed(-1)}>New Embed</ButtonReact>
	{/if}

	<Spacer typ="smallSpacing" />

	<InputTextArea
		id="templatebuilder-content"
		label="Content"
		placeholder="Message content"
		bind:value={templateBuilderData.content}
		minlength={0}
		showErrors={false}
	/>
{:else if openTab == 'advanced'}
	<div class="default-snips">
		<h3 class="text-2xl">Need inspiration?</h3>
		<p>Check out some templates/snippets</p>
		{#each Object.entries(defaultSnippets) as [key, value]}
			<ButtonReact
				onclick={() => {
					rawTemplateOutput = value(rawTemplateOutput);
				}}>{title(key)}</ButtonReact
			>
		{/each}
	</div>

	<InputTextArea
		id="templatebuilder-raw"
		label="Raw Template"
		placeholder="Raw template"
		bind:value={rawTemplateOutput}
		minlength={0}
		showErrors={false}
	/>
{/if}
