<script lang="ts">
	export let value: boolean = false;

	export let disabled: boolean;
	export let required: boolean = false;
	export let id: string;
	export let label: string;
	export let description: string;
	export let onChange: undefined | ((value: boolean) => void);
</script>

<div class="col-span-9 pt-2 lg:pt-0 justify-middle items-center align-bottom text-lg flex">
	<label class="inline-flex items-center cursor-pointer">
		<input
			type="checkbox"
			class="sr-only peer"
			{id}
			name={id}
			bind:checked={value}
			on:change={() => {
				if (onChange) onChange(value);
			}}
			{disabled}
			aria-disabled={disabled}
			{required}
			aria-required={required}
		/>

		<div
			class="relative w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
		/>
		<span class="ms-2 text-md font-bold font-monster text-white">{label}</span>
	</label>
</div>

<p class="opacity-80 text-sm">{description}</p>
