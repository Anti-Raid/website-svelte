<script lang="ts">
	import { StreamLanguage } from '@codemirror/language';
	import CodeMirrorIde from '../../../components/CodeMirrorIDE.svelte';
	import { lua } from '@codemirror/legacy-modes/mode/lua';
	import { oneDark } from '@codemirror/theme-one-dark';
	import { getVersion } from '$lib/configs/functions/versioner';
	import Eval from 'open-eval';
	import { type Terminal } from '@battlefieldduck/xterm-svelte';
	import TerminalComp from '../../../components/Terminal.svelte';

	let terminal: Terminal;

	// Value
	let value = '';

	// Terminal Onload
	const onLoad = () => {
		terminal.writeln('Welcome to the Internal Test REPL System!');
		terminal.writeln('This may be used in a later production environment!');
		terminal.writeln('Default Language: Lua');
                terminal.writeln(`AntiRaid Version: ${getVersion()}`);
		terminal.writeln(
			'\nInstructions: Write code above in the IDE, and press the RUN button in the top-right corner.'
		);
	};

	// Execute Code
	const executeCode = async () => {
		terminal?.clear();
		const ev = new Eval();
		const i = await ev.eval('lua', value);
		terminal.writeln(
			`${i.language.charAt(0).toUpperCase() + i.language.slice(1)}: v${i.version} REPL\n`
		);
		terminal.writeln(`Output: ${i.output}`);
	};
</script>

<CodeMirrorIde
	bind:value
	execute={executeCode}
	extensions={[StreamLanguage.define(lua).extension]}
	theme={oneDark}
	placeholder="Start typing your code here."
/>

<div class="p-3" />
<TerminalComp bind:terminal commands={[]} onload={onLoad} />
