<script lang="ts">
	import { Embed } from '../../../../components/dashboard/message_templatebuilder/types';
	import TemplateBuilderEmbed from '../../../../components/dashboard/message_templatebuilder/TemplateBuilderEmbed.svelte';
	import { generateTemplateFragmentForEmbed } from '../../../../components/dashboard/message_templatebuilder/common';

	let embed: Embed = {
		title: '',
		description: '',
		fields: []
	};

	let embedTemplateFragment: string;
	$: embed, (embedTemplateFragment = generateTemplateFragmentForEmbed(embed));
</script>

<div class="px-4">
	<TemplateBuilderEmbed bind:embed />

	<small class="text-white font-semibold">embed: {JSON.stringify(embed)}</small><br />
	<code class="text-white whitespace-pre">templateFragment: {embedTemplateFragment}</code>
</div>
