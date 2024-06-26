<script lang="ts">
	export let onclick: (e: MouseEvent) => void;
</script>

<button
	class="button text-sm px-1 py-2 rounded-md bg-secondary-600 hover:bg-secondary-500 font-semibold tracking-tight"
	on:click={onclick}><slot /></button
>
