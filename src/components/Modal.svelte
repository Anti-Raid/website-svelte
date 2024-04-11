<script lang="ts">
	export let title: string; // Modal Title
	export let logo: string = "/logo.webp"; // Logo URL

	export let showModal: boolean; // boolean, whether or not the modal is shown or not

	let dialog: HTMLDialogElement;

	$: if (dialog && showModal) dialog.showModal();
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<dialog
	class="modal"
	bind:this={dialog}
	on:close={() => (showModal = false)}
	on:click|self={() => dialog.close()}
>
	<div
		class="modal z-50 fixed w-full h-full top-0 left-0 flex items-center justify-center p-8 lg:p-0"
	>
		<div class="modal-overlay fixed w-full h-full bg-gray-900 opacity-50" />

		<div
			class="bg-slate-800 w-full lg:h-max lg:w-1/2 mx-auto rounded-lg shadow-xl z-50 overflow-y-auto"
		>
			<div
				class="flex justify-between items-center head bg-slate-800 text-primary-400 py-5 px-8 text-2xl font-extrabold"
			>
				<div class="flex">
					<img class="h-10 rounded-full" src={logo} alt={title} />
					<h2 class="ml-2 mt-1">{title}</h2>
				</div>

				<button
					class="p-2 bg-surface-500 hover:bg-surface-600 text-white rounded-full ml-4"
					on:click={() => dialog.close()}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						height="24px"
						viewBox="0 0 24 24"
						width="24px"
						fill="currentColor"
						class="text-primary-400"
						><path d="M0 0h24v24H0V0z" fill="none" /><path
							d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"
						/></svg
					>
				</button>
			</div>

			<div class="content p-4 text-white">
				<slot />
			</div>
		</div>
	</div>
</dialog>
