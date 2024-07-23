<script lang="ts">
	export let title: string;
	export let id: string;
</script>

<fieldset class="section m-4" {id}>
	<legend class="p-3 text-2xl font-bold">{title}</legend>
	<div class="content">
		<slot />
	</div>
</fieldset>

<style>
	.section {
		display: grid;
	}

	fieldset {
		border: 3px solid transparent;
		border-color: rgb(255 255 0 / var(--tw-text-opacity));
		box-sizing: border-box;
		grid-area: 1 / 1; /* first row, first column */
		padding: 20px;
		width: inherit;
	}
</style>
