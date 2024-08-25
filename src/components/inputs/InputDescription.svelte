<script lang="ts">
	export let description: string | undefined;
</script>

{#if description}
	<p class="text-md mb-2 opacity-80">{@html description}</p>
{/if}
