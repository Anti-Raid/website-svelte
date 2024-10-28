<script lang="ts">
	import { onMount } from 'svelte';
	import SleekButton from '../../inputs/button/SleekButton.svelte';
	import {
		builderVersion,
		ParsedTemplateBuilderComment,
		parseTemplateBuilderDataCommentFromTemplate,
		TemplatePragma
	} from './common';
	import logger from '$lib/ui/logger';

	import MessageBuilder from './message/Builder.svelte';

	export let showTypes: string[] = [];
	export let output: string = '';

	let data: ParsedTemplateBuilderComment;
	let isMounted = false;

	onMount(() => {
		// Initialize or fetch any necessary data here
		data = parseTemplateBuilderDataCommentFromTemplate(output);
		isMounted = true;

		logger.info('TemplateBuilder mounted', { data });
	});

	interface TemplateBuilderType {
		name: string;
		description: string;
		value: string;
		component: any;
	}

	const types: TemplateBuilderType[] = [
		{
			name: 'Message',
			description: 'Create a template for sending a message on response to the action.',
			value: 'message',
			component: MessageBuilder
		},
		{
			name: 'CAPTCHA',
			description: 'Create a template for sending a CAPTCHA on response to the action.',
			value: 'captcha',
			component: async () => {} // Placeholder
		},
		{
			name: 'Custom',
			description: 'Create a custom template for your specific needs.',
			value: 'custom',
			component: async () => {} // Placeholder
		}
	];

	type Snippet = (current: string) => string;

	export const defaultSnippets: Record<string, Snippet> = {
		'Add Pragma': function (current: string): string {
			return String.raw`-- @pragma {"lang":"lua","allowed_caps":["discord:sendmessage_channel"]}\n${current}`;
		}
	};

	let templateBuilderNeededCaps: string[] = [];
	let templateBuilderOutput: string = '';

	function updateOutput() {
		if (!templateBuilderOutput) {
			return '';
		}

		let pragma: TemplatePragma = {
			lang: 'lua',
			allowed_caps: templateBuilderNeededCaps,
			builderInfo: data.comment
		};

		return `-- @pragma ${JSON.stringify(pragma)}\n${templateBuilderOutput}`;
	}

	$: if (templateBuilderOutput || data?.comment?.for) {
		output = updateOutput();
	}
</script>

{#if isMounted}
	{#if !data.comment.for}
		<h1 class="text-2xl font-bold">What type of template would you like to build?</h1>
		<section class="mt-4 mb-4">
			<div class="col-span-8 grid grid-cols-1 gap-6 lg:grid-cols-2 h-full">
				{#each types as type}
					{#if showTypes.length == 0 || showTypes.includes(type.value)}
						<SleekButton
							onclick={() => {
								data.comment.for = type.value;
							}}
							name={type.name}
							description={type.description}
						/>
					{/if}
				{/each}
			</div>
		</section>
	{/if}

	{#if types.find((type) => type.value === data.comment.for)?.component}
		<svelte:component
			this={types.find((type) => type.value === data.comment.for)?.component}
			bind:templateBuilderData={data.comment.data}
			bind:output={templateBuilderOutput}
			bind:neededCaps={templateBuilderNeededCaps}
		/>
	{/if}
{/if}
