<script lang="ts">
	import { TemplateBuilderData } from '../../../components/dashboard/templatebuilder/types';
	import TemplateBuilder from '../../../components/dashboard/templatebuilder/TemplateBuilder.svelte';
	import { generateTemplateForTemplateBuilderData } from '../../../components/dashboard/templatebuilder/common';

	let templateBuilderData: TemplateBuilderData = {
		embeds: [{ title: '', description: '', fields: [] }],
		content: ''
	};

	let templateFragment: string;
	$: templateBuilderData,
		(templateFragment = generateTemplateForTemplateBuilderData(templateBuilderData));
</script>

<div class="px-4">
	<TemplateBuilder bind:templateBuilderData />

	<small class="text-white font-semibold"
		>templateBuilderData: {JSON.stringify(templateBuilderData)}</small
	><br />
	<code class="text-white whitespace-pre">templateFragment: {templateFragment}</code>
</div>
