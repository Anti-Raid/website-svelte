<script lang="ts">
	export let value: boolean = false;

	export let disabled: boolean;
	export let required: boolean = false;
	export let id: string;
	export let label: string;
	export let description: string;
	export let onChange: undefined | ((value: boolean) => void);
</script>

<div class="mt-4 col-span-9 pt-2 lg:pt-0 justify-middle items-center align-bottom text-lg flex">
	<input
		{id}
		name={id}
		type="checkbox"
		bind:checked={value}
		on:change={() => {
			if (onChange) onChange(value);
		}}
		aria-disabled={disabled}
		{disabled}
		{required}
		aria-required={required}
		class="rounded-full cursor-pointer checked:bg-blue-500 disabled:checked:bg-blue-500 disabled:checked:opacity-85 disabled:cursor-not-allowed disabled:bg-slate-500"
	/>

	<label for={id} class="text-white text-left">
		<span class="text-white text-left ml-1">
			<span class="text-gray-200 hover:cursor-pointer font-semibold">
				{label}
			</span>
		</span>
	</label>
</div>

<p class="opacity-80 text-sm">{description}</p>
