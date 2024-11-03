<script lang="ts">
	import TemplateBuilder from '@components/dashboard/templating/TemplateBuilder.svelte';

	let output: string = `-- @pragma {"lang":"lua","allowed_caps":["discord:sendmessage_channel"],"builderInfo":{"ver":2,"for":"message","data":{"embeds":[{"title":"sgsg","description":"","fields":[]}],"content":"sj"}}}`;
</script>

<div class="px-4">
	<TemplateBuilder bind:output />

	<code class="text-white whitespace-pre-wrap">templateFragment: {output}</code>
</div>
