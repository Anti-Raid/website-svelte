<script lang="ts">
	// Imports
	import { type Terminal, Xterm, XtermAddon } from '@battlefieldduck/xterm-svelte';
	import {
		type ITerminalOptions,
		type ITerminalInitOnlyOptions
	} from '@battlefieldduck/xterm-svelte';

	// Exports
	export let terminal: Terminal;
	export let commands: {
		name: string;
		description: string;
		hidden: boolean;
		args: string[];
		execute: (terminal: Terminal, data: any) => void;
	}[];
	export let onload: (terminal: Terminal) => void = () => {};
	export let ondata: (terminal: Terminal, data: string) => void = () => {};

	// Commands
	const commandMap: Map<
		string,
		{
			name: string;
			description: string;
			hidden: boolean;
			args: string[];
			execute: (terminal: Terminal, data: any) => void;
		}
	> = new Map();
	commands.map((p) => commandMap.set(p.name, p));

	// Command Entered
	const commandEntered = async (cmd: string) => {
		const parts = cmd.trim().split(' ');
		const command = parts[0];
		const args = parts.slice(1);

		if (commandMap.has(command)) {
			const { execute } = commandMap.get(command)!;
			execute(terminal, { args: args });
		} else terminal.writeln(`Error: Command "${command}" not found.\n`);
	};

	// Terminal Options
	let options: ITerminalOptions & ITerminalInitOnlyOptions = {
		fontFamily: 'Noto Mono',
		cursorBlink: true
	};

	// Component Load
	const onLoad = async (event: CustomEvent<{ terminal: Terminal }>) => {
		terminal = event.detail.terminal;

		const fitAddon = new (await XtermAddon.FitAddon()).FitAddon();
		terminal.loadAddon(fitAddon);
		fitAddon.fit();

		onload(terminal);
	};

	// Data event
	const onData = (event: CustomEvent<string>) => {
		const data = event.detail;
		if (!terminal) return;
		ondata(terminal, data);
	};

	// Key event
	let currentLine = '';
	let entries: string[] = [];
	const onKey = async (event: CustomEvent<{ key: string; domEvent: KeyboardEvent }>) => {
		const data = event.detail;
		if (!terminal) return;

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
</script>

<Xterm {options} on:load={onLoad} on:data={onData} on:key={onKey} />
