<script lang="ts">
	export let id: string;
	export let label: string;
</script>

{#if label}
	<label for={id} class="text-white text-xl text-left">{label}</label>
{/if}
