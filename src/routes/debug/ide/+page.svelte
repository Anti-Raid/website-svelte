<script lang="ts">
	import { StreamLanguage } from '@codemirror/language';
	import CodeMirrorIde from '../../../components/CodeMirrorIDE.svelte';
	import { lua } from '@codemirror/legacy-modes/mode/lua';
	import { oneDark } from '@codemirror/theme-one-dark';
	import type { PageData } from './$types';
	import { type Terminal, Xterm, XtermAddon } from '@battlefieldduck/xterm-svelte';
	import {
		type ITerminalOptions,
		type ITerminalInitOnlyOptions
	} from '@battlefieldduck/xterm-svelte';

	// Get data from server.
	export let data: PageData;

	// Commands
	const commands: Map<
		string,
		{
			name: string;
			description: string;
			hidden: boolean;
			args: string[];
			execute: (terminal: Terminal, data: any) => void;
		}
	> = new Map();
	data.commands.map((p) => commands.set(p.name, p));

	const commandEntered = async (cmd: string) => {
		const parts = cmd.trim().split(' ');
		const command = parts[0];
		const args = parts.slice(1);

		if (commands.has(command)) {
			const { execute } = commands.get(command)!;
			execute(terminal, { args: args });
		} else terminal.writeln(`Error: Command "${command}" not found.\n`);
	};

	// Terminal Options
	let options: ITerminalOptions & ITerminalInitOnlyOptions = {
		fontFamily: 'Consolas',
		cursorBlink: true
	};

	// Page Load
	let terminal: Terminal;
	const onLoad = async (event: CustomEvent<{ terminal: Terminal }>) => {
		terminal = event.detail.terminal;

		const fitAddon = new (await XtermAddon.FitAddon()).FitAddon();
		terminal.loadAddon(fitAddon);
		fitAddon.fit();

		terminal.writeln('Connecting to server...');
		setTimeout(() => {
			terminal.clear();
			terminal.writeln('Welcome to AntiRaid!');
			terminal.writeln('Type "help" for a list of commands.\n');
			terminal.write('$: ');
		}, 4000);
	};

	// Data event
	const onData = (event: CustomEvent<string>) => {
		const data = event.detail;
	};

	// Key event
	let currentLine = '';
	let entries: string[] = [];
	const onKey = async (event: CustomEvent<{ key: string; domEvent: KeyboardEvent }>) => {
		const data = event.detail;

		// Enter
		if (data.domEvent.keyCode === 13) {
			entries.push(currentLine);

			if (currentLine != '') {
				terminal.write('\r\n');
				await commandEntered(currentLine);
				terminal.write('\r$: ');
			} else terminal.write('\r\n$: ');

			currentLine = '';
		}
		// Backspace
		else if (data.domEvent.keyCode === 8) {
			if (currentLine) {
				currentLine = currentLine.slice(0, currentLine.length - 1);
				terminal.write('\b \b');
			}
		}
		// Regular Input
		else {
			currentLine += data.key;
			terminal.write(data.key);
		}
	};

	let value = '';
</script>

<CodeMirrorIde bind:value extensions={[StreamLanguage.define(lua).extension]} theme={oneDark} placeholder="Start typing your code here." />

<div class="p-3" />
<Xterm {options} on:load={onLoad} on:data={onData} on:key={onKey} />

<textarea
	id="editor"
	rows="8"
	class="mt-3 block w-full px-2 text-sm rounded-md text-white bg-slate-600 font-cabin font-semibold border-0 focus:ring-0"
	placeholder="Sorry, no data was recieved from the server."
	contenteditable="false"
	{value}
	required
/>
