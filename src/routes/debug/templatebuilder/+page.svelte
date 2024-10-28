<script lang="ts">
	import TemplateBuilder from '../../../components/dashboard/templating/TemplateBuilder.svelte';

	let output: string;
</script>

<div class="px-4">
	<TemplateBuilder bind:output />

	<code class="text-white whitespace-pre-wrap">templateFragment: {output}</code>
</div>
