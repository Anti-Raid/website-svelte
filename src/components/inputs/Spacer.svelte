<script lang="ts">
	export let typ: 'label' | 'input' | 'extSpacing' | 'hr';
</script>

<div class="mt-3 mb-3" aria-hidden={true} data-spacer-typ={typ} />
