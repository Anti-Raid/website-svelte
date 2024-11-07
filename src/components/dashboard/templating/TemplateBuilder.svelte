<script lang="ts">
	import SleekButton from '../../inputs/button/SleekButton.svelte';

	import MessageBuilder from './message/Builder.svelte';
	import BoxButton from '../../inputs/button/BoxButton.svelte';
	import InputTextArea from '../../inputs/InputTextArea.svelte';

	export let id: string;
	export let label: string;
	export let output: string = '';
	export let disabled: boolean = false;
	export let openBuilder: string = '';
	export let openBuilderOutput: string = '';

	type Snippet = (current: string) => string;

	export const defaultSnippets: Record<string, Snippet> = {
		'Add Pragma': function (current: string): string {
			return `-- @pragma {"lang":"lua","allowed_caps":["discord:create_message"]}\n${current}`;
		}
	};
</script>

<InputTextArea
	{id}
	{label}
	bind:value={output}
	placeholder="Enter your template here..."
	required={true}
	{disabled}
	minlength={0}
	showErrors={false}
/>

{#if !disabled}
	<!--Snippets-->
	<details>
		<summary>Snippets</summary>
		{#each Object.keys(defaultSnippets) as snippet}
			<BoxButton
				onClick={() => {
					output = defaultSnippets[snippet](output);
				}}
			>
				{snippet}
			</BoxButton>
		{/each}
	</details>

	<SleekButton
		onclick={() => {
			openBuilder = 'message';
		}}
		name="Create Message"
		description="Click here to allow for easy message creation."
	/>

	{#if openBuilder == 'message'}
		<MessageBuilder bind:output={openBuilderOutput} />

		<BoxButton
			onClick={() => {
				openBuilder = '';
				output += openBuilderOutput;
			}}
		>
			Add Message
		</BoxButton>
	{/if}
{/if}
