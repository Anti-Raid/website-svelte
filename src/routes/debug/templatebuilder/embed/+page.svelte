<script lang="ts">
	import { Embed } from '../../../../components/dashboard/templatebuilder/types';
	import TemplateBuilderEmbed from '../../../../components/dashboard/templatebuilder/TemplateBuilderEmbed.svelte';
	import { generateTemplateFragmentForEmbed } from '../../../../components/dashboard/templatebuilder/common';

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
