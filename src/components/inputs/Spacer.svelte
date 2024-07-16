<script lang="ts">
	export let typ: 'label' | 'input' | 'extSpacing' | 'hr' | 'smallSpacing';
</script>

{#if typ == 'label' || typ == 'smallSpacing'}
	<div class="mt-2 mb-2" aria-hidden={true} />
{:else if typ == 'input' || typ == 'hr'}
	<div class="mt-9 mb-9" aria-hidden={true} data-spacer-typ={typ} />
{:else}
	<div class="mt-5 mb-5" aria-hidden={true} data-spacer-typ={typ} />
{/if}
