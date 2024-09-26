<script lang="ts">
	const getDevModeStatus = async () => {
		return localStorage.getItem('devMode') === 'true';
	};
</script>

{#await getDevModeStatus() then devMode}
	{#if devMode}
		<slot />
	{/if}
{/await}
