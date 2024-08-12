<script lang="ts">
	import type { SMOption } from './select';

	export let id: string;
	export let choices: SMOption[];
	export let required: boolean = true;
	export let disabled: boolean = false;
	export let defaultLabel: string = 'Select an action';
	export let value: string[] = [];
	export let maxLabels: number;

	const getLabel = (value: string[]) => {
		if (value.length == 0) {
			return defaultLabel;
		} else {
			let labelValues = [];

			for (let choice of choices) {
				if (labelValues.length > maxLabels) {
					labelValues.push(`and ${value.length - maxLabels} more`);
					break;
				}

				if (value.includes(choice.value)) {
					labelValues.push(choice.label);
				}
			}

			return labelValues.join(', ');
		}
	};

	let isOpen: boolean;
</script>

<!--For screen readers-->
<select {id} class="sr-only" multiple {required} aria-required={required} bind:value>
	{#each choices as choice}
		<option value={choice.value}>{choice.label}</option>
	{/each}
</select>

<div class="not-sr-only">
	<button
		on:click={() => {
			isOpen = !isOpen;
		}}
		class={disabled
			? 'w-full text-left mx-auto flex bg-black bg-opacity-50 text-gray-100 border border-primary-200 focus:outline-none py-4 px-6 rounded-xl'
			: 'w-full text-left mx-auto flex transition duration-200 hover:bg-slate-900 bg-black bg-opacity-100 text-white focus:text-primary-400 border border-primary-200 focus:border-primary-400 focus:outline-none py-4 px-6 rounded-xl'}
	>
		{getLabel(value)}

		<!--Down arrow at end of button-->
		<svg
			class="w-6 h-6 ml-auto"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 20 20"
			fill="currentColor"
		>
			<path
				fill-rule="evenodd"
				d="M10 12.586l-4.293-4.293-1.414 1.414L10 15.414l5.707-5.707-1.414-1.414z"
			/>
		</svg>
	</button>

	{#if isOpen}
		<div
			class="z-10 w-full bg-black bg-opacity-100 border border-primary-200 focus:border-primary-400 focus:outline-none rounded-xl"
		>
			{#each choices as choice}
				<button
					class={value.includes(choice.value)
						? 'w-full mx-auto flex bg-primary-400 text-black border border-primary-400 focus:border-primary-400 focus:outline-none py-4 px-6 rounded-xl'
						: 'w-full mx-auto flex transition duration-200 hover:bg-slate-900 text-white focus:text-primary-400 focus:border-primary-400 focus:outline-none py-4 px-6 rounded-xl'}
					on:click={() => {
						if (value.includes(choice.value)) {
							value = value.filter((v) => v !== choice.value);
						} else {
							value = [...value, choice.value];
						}
					}}>{choice.label}</button
				>
			{/each}
		</div>
	{/if}
</div>
