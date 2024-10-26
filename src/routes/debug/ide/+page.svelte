<script lang="ts">
	import { StreamLanguage } from '@codemirror/language';
	import CodeMirrorIde from '../../../components/CodeMirrorIDE.svelte';
	import { type File } from '../../../components/CodeMirrorIDE.svelte';
	import { lua } from '@codemirror/legacy-modes/mode/lua';
	import { oneDark } from '@codemirror/theme-one-dark';
	import { getVersion } from '$lib/configs/functions/versioner';
	import Eval from 'open-eval';
	import { type Terminal } from '@battlefieldduck/xterm-svelte';
	import TerminalComp from '../../../components/Terminal.svelte';
	import { PageData } from './$types';

	let terminal: Terminal;

	// Files
	let files: File[] = [
		{
			name: 'main',
			value: `print("Oh my fucking god, please end my life already.")`,
			lang: 'lua',
			icon: 'devicon:lua',
			open: true
		},
		{
			name: 'robodog',
			value: `console.log("robodog goes brrrrr.")`,
			lang: 'ts',
			icon: 'devicon:typescript',
			open: false
		}
	];

	// Value
	let value = files.find((p) => p.open === true)?.value || '';

	// Terminal Onload
	const onLoad = () => {
		terminal.writeln('Welcome to the Internal Test REPL System!');
		terminal.writeln('This may be used in a later production environment!');
		terminal.writeln('Default Language: Lua');
		terminal.writeln(`AntiRaid Version: ${getVersion()}`);
		terminal.writeln(
			'\nInstructions: Write code above in the IDE, and press the Execute button in the top-right corner.'
		);
		terminal.write(`\n\n$: `);
	};

	// Execute Code
	let running: boolean = false;
	const executeCode = async () => {
		running = true;
		terminal?.clear();
		const ev = new Eval();
		const i = await ev.eval('lua', value);
		terminal.writeln(
			`${i.language.charAt(0).toUpperCase() + i.language.slice(1)}: v${i.version} REPL\n`
		);
		terminal.writeln(`Output: ${i.output}`);
		running = false;
	};

	// Get commands
	export let data: PageData;
</script>

<CodeMirrorIde
	bind:value
	execute={executeCode}
	{files}
	{running}
	extensions={[StreamLanguage.define(lua).extension]}
	theme={oneDark}
	placeholder="Start typing your code here."
/>

<div class="p-3" />
<TerminalComp bind:terminal commands={data.commands} onload={onLoad} />
