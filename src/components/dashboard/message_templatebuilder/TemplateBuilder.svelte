<script lang="ts">
	import { browser } from '$app/environment';
	import logger from '$lib/ui/logger';
	import { onDestroy, onMount } from 'svelte';
	import { NoticeProps } from '../../common/noticearea/noticearea';
	import NoticeArea from '../../common/noticearea/NoticeArea.svelte';
	import TabButton from '../../inputs/button/tabs/TabButton.svelte';
	import InputTextArea from '../../inputs/InputTextArea.svelte';
	import Label from '../../inputs/Label.svelte';
	import ButtonReact from '../../inputs/multi/Button.svelte';
	import DangerButton from '../../inputs/multi/DangerButton.svelte';
	import Spacer from '../../inputs/Spacer.svelte';
	import {
		generateTemplateForTemplateBuilderData,
		parseTemplateBuilderDataCommentFromTemplate
	} from './common';
	import TemplateBuilderEmbed from './TemplateBuilderEmbed.svelte';
	import { defaultData, TemplateBuilderData } from './types';

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

	// This is a hack to allow component html to switch tabs

	$: if (browser) {
		// @ts-ignore
		window.__messageTemplateBuilderSwitchImplYes = () => {
			logger.info('TemplateBuilder#Message.switchTab', switchTab);
			if (switchTab) {
				openTab = switchTab;
				switchTab = null;
				noticeProps = null;
			}
		};

		// @ts-ignore
		window.__messageTemplateBuilderSwitchImplNo = () => {
			if (switchTab) {
				switchTab = null;
				noticeProps = null;
			}
		};
	}

	let openTab: string;

	let noticeProps: NoticeProps | null = null;
	let switchTab: string | null = null;

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
				noticeProps = {
					level: 'warn',
					text: `You have unsaved changes. Are you sure you want to switch tabs?
					
<button class="text-red-500" onclick="__messageTemplateBuilderSwitchImplYes()">Yes</button>
<button class="text-green-500" onclick="__messageTemplateBuilderSwitchImplNo()">No</button>
					`
				};
				switchTab = 'builder';
			} else {
				openTab = 'builder';
				noticeProps = null;
			}
		} else {
			openTab = 'builder';
			noticeProps = null;
		}
	}}
/>

<TabButton
	visible={openTab == 'advanced'}
	text={'Advanced'}
	onClick={() => {
		openTab = 'advanced';
		noticeProps = null;
	}}
/>

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
	<InputTextArea
		id="templatebuilder-raw"
		label="Raw Template"
		placeholder="Raw template"
		bind:value={rawTemplateOutput}
		minlength={0}
		showErrors={false}
	/>
{/if}
