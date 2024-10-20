<script lang="ts">
	import { StreamLanguage } from '@codemirror/language';
	import CodeMirrorIde from '../../../components/CodeMirrorIDE.svelte';
	import { lua } from '@codemirror/legacy-modes/mode/lua';
	import { oneDark } from '@codemirror/theme-one-dark';

	let value = '';
</script>

<CodeMirrorIde
	bind:value
	extensions={[StreamLanguage.define(lua).extension]}
	theme={oneDark}
/>

<textarea
	id="editor"
	rows="8"
	class="mt-3 block w-full px-2 text-sm rounded-md text-white bg-slate-600 font-cabin font-semibold border-0 focus:ring-0"
	placeholder="Sorry, no data was recieved from the server."
	contenteditable="false"
	{value}
	required
/>
