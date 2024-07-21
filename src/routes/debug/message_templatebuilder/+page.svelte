<script lang="ts">
	import { TemplateBuilderData } from '../../../components/dashboard/message_templatebuilder/types';
	import TemplateBuilder from '../../../components/dashboard/message_templatebuilder/TemplateBuilder.svelte';

	let templateBuilderData: TemplateBuilderData;

	let templateFragment: string;
</script>

<div class="px-4">
	<TemplateBuilder bind:templateBuilderData bind:rawTemplateOutput={templateFragment} />

	<small class="text-white font-semibold"
		>templateBuilderData: {JSON.stringify(templateBuilderData)}</small
	><br />
	<code class="text-white whitespace-pre-wrap">templateFragment: {templateFragment}</code>
</div>
