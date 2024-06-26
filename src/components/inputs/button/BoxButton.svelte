<script lang="ts">
	export let onclick: (e: MouseEvent) => void;
	export let text: string;
</script>

<button class="bg-primary-600 hover:bg-primary-400 p-2" on:click={onclick}>{text}</button>
