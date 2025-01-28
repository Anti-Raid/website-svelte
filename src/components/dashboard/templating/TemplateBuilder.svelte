<script lang="ts">
	import CodeMirrorIde from '@components/CodeMirrorIDE.svelte';
	import Label from '@components/inputs/Label.svelte';
	import { StreamLanguage } from '@codemirror/language';
	import { lua } from '@codemirror/legacy-modes/mode/lua';
	import { oneDark } from '@codemirror/theme-one-dark';
	import BoxButton from '@components/inputs/button/BoxButton.svelte';

	export let id: string;
	export let label: string;
	export let output: string = '';

	type Snippet = (current: string) => string;

	export const defaultSnippets: Record<string, Snippet> = {
		'Add Pragma': function (current: string): string {
			return `-- @pragma {"lang":"lua","allowed_caps":["discord:create_message"]}\n${current}`;
		}
	};
</script>

<Label {id} {label} />
<CodeMirrorIde
	bind:value={output}
	files={[]}
	isFilesEnabled={false}
	extensions={[StreamLanguage.define(lua).extension]}
	theme={oneDark}
	placeholder="Start typing your code here."
/>

{#if output?.length > 0}
	<BoxButton onClick={() => (output = '')}>Clear</BoxButton>
{/if}
