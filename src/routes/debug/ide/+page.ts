// Modules
import type { Terminal } from '@battlefieldduck/xterm-svelte';

// Help
const help = (terminal: Terminal) => {
	terminal.writeln('Available commands:');

	data.forEach((command) => {
		let example = '';
		if (command.args.length > 0)
			example = `Example: ${command.name} ${command.args.map((i) => `<${i}>`)}`;
		if (!command.hidden) terminal.writeln(`- ${command.name}: ${command.description} ${example}`);
	});
};

// Clear
const clear = (terminal: Terminal) => {
	terminal.clear();

	terminal.writeln('Welcome to AntiRaid!');
	terminal.writeln('Type "help" for a list of commands.\n');
};

// bash
const bash = (terminal: Terminal, data: any) => {
	if (data.args.length === 0) terminal.writeln('Error: No file specified.');
	else {
		const file = data.args[0];
		terminal.writeln(`Error: File not found`);
	}
};

// Commands
const data: {
	name: string;
	description: string;
	hidden: boolean;
	args: string[];
	execute: (terminal: Terminal, data: any) => void;
}[] = [
	{
		name: 'clear',
		description: 'Clear the terminal screen.',
		hidden: false,
		args: [],
		execute: (terminal: Terminal, data: any) => clear(terminal)
	},
	{
		name: 'help',
		description: 'Display a list of available commands.',
		hidden: false,
		args: [],
		execute: (terminal: Terminal, data: any) => help(terminal)
	},
	{
		name: 'bash',
		description: 'Open executable file.',
		hidden: false,
		args: ['file'],
		execute: (terminal: Terminal, data: any) => bash(terminal, data)
	}
];

// Send data to page.
export const load = async () => {
	return {
		commands: data
	};
};
