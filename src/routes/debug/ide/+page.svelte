<script lang="ts">
	import { StreamLanguage } from '@codemirror/language';
	import CodeMirrorIde from '../../../components/CodeMirrorIDE.svelte';
	import { type File } from '../../../components/CodeMirrorIDE.svelte';
	import { lua } from '@codemirror/legacy-modes/mode/lua';
	import { oneDark } from '@codemirror/theme-one-dark';
	import { getVersion } from '$lib/configs/functions/versioner';
	import { type Terminal } from '@battlefieldduck/xterm-svelte';
	import TerminalComp from '../../../components/Terminal.svelte';
	import { PageData } from './$types';
	import InputText from '../../../components/inputs/InputText.svelte';
	import { getAuthCreds } from '$lib/auth/getAuthCreds';
	import { ExecuteTemplateRequest, ExecuteTemplateResponse } from '$lib/generated/types';
	import { fetchClient } from '$lib/fetch/fetch';

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

	// Guild ID
	let guildIDValue: string = '';

	// Terminal Onload
	const onLoad = () => {
		terminal.writeln('Welcome to the Internal Templating Test System!');
		terminal.write(`\n\n$: `);
	};

	// Execute Code
	let running: boolean = false;
	/*const executeCode = async () => {
		running = true;
		terminal?.clear();
		const ev = new Eval();
		const i = await ev.eval('lua', value);
		terminal.writeln(
			`${i.language.charAt(0).toUpperCase() + i.language.slice(1)}: v${i.version} REPL\n`
		);
		terminal.writeln(`Output: ${i.output}`);
		running = false;
	};*/
	const executeCode = async () => {
		running = true;
		terminal?.clear();

		let creds = getAuthCreds();
		if (!creds) throw new Error('Auth credentials not found');
		let req: ExecuteTemplateRequest = { args: {}, template: value };
		let res = await fetchClient(`/guilds/${guildIDValue}/execute-template`, {
			auth: creds?.token,
			method: 'POST',
			body: JSON.stringify(req)
		});
		if (!res.ok) throw new Error(await res.error());
		let resp: ExecuteTemplateResponse = await res.json();

		terminal?.write(JSON.stringify(resp));
		running = false;
	};

	// Get commands
	export let data: PageData;
</script>

<InputText
	id="guildid"
	label="Guild ID"
	placeholder="Enter your Guild ID here!"
	minlength={0}
	bind:value={guildIDValue}
/>

<div class="p-2" />

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
