<!--From https://svelte.dev/examples/modal -->
<script lang="ts">
	export let title: string; // string, the title of the modal
	export let showModal: boolean; // boolean, whether or not the modal is shown or not
	let dialog: HTMLDialogElement; // HTMLDialogElement
	$: if (dialog && showModal) dialog.showModal();
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<dialog
	class="px-4 py-2 rounded-md bg-slate-800"
	bind:this={dialog}
	on:close={() => (showModal = false)}
	on:click|self={() => dialog.close()}
>
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div on:click|stopPropagation>
		<!-- svelte-ignore a11y-autofocus -->
		<button class="close-btn bg-surface-500 hover:bg-surface-600 text-white rounded-full ml-4" autofocus on:click={() => dialog.close()}>
			<span class="sr-only">Close</span>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				height="24px"
				viewBox="0 0 24 24"
				width="24px"
				fill="currentColor"
				class="text-primary-400"
			>
				<path d="M0 0h24v24H0V0z" fill="none" />
				<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
			</svg>
		</button>
		<h1 class="font-semibold text-xl">{title}</h1>
		<hr />
		<div class="mb-4" />
		<slot />
		<div class="mb-4" />
	</div>
</dialog>

<style>
	dialog {
		width: 40em;
		border-radius: 0.2em;
		border: none;
		color: white;
	}
	dialog::backdrop {
		background: rgba(0, 0, 0, 0.2);
	}
	dialog > div {
		padding: 1em;
	}
	dialog[open] {
		animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}
	@keyframes zoom {
		from {
			transform: scale(0.95);
		}
		to {
			transform: scale(1);
		}
	}
	dialog[open]::backdrop {
		animation: fade 0.2s ease-out;
	}
	@keyframes fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	.close-btn {
		margin-left: auto;
		float: right;
	}
</style>
