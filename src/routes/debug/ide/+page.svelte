<script lang="ts">
	import { StreamLanguage } from '@codemirror/language';
	import CodeMirrorIde from '@components/CodeMirrorIDE.svelte';
	import { type File } from '@components/CodeMirrorIDE.svelte';
	import { lua } from '@codemirror/legacy-modes/mode/lua';
	import { oneDark } from '@codemirror/theme-one-dark';
	import { type Terminal } from '@battlefieldduck/xterm-svelte';
	import TerminalComp from '@components/Terminal.svelte';
	import { PageData } from './$types';
	import InputText from '@components/inputs/InputText.svelte';
	import { getAuthCreds } from '$lib/auth/getAuthCreds';
	import { ExecuteTemplateRequest, ExecuteTemplateResponse } from '$lib/generated/types';
	import { fetchClient } from '$lib/fetch/fetch';
	import { get } from '$lib/configs/functions/services';

	let terminal: Terminal;

	// Files
	let files: File[] = [
		{
			name: 'main',
			value: `print("Oh my fucking god, please end my life already.")`,
			lang: 'luau',
			icon: 'vscode-icons:file-type-luau',
			open: true
		}
	];

	// Value
	let value = files.find((p) => p.open === true)?.value || '';

	// Guild ID
	let guildIDValue: string = '';

	// Terminal Onload
	const onLoad = () => {
		terminal.writeln('Welcome to the Internal Templating Test System!');
		terminal.write(`\n\nroot@antiraid.xyz $: `);
	};

	// Execute Code
	let running: boolean = false;
	const executeCode = async () => {
		running = true;
		terminal?.clear();

		let creds = getAuthCreds();
		try {
			if (!creds) throw new Error('Auth credentials not found');
			if (!guildIDValue) throw new Error('Guild ID not set');
			let req: ExecuteTemplateRequest = { args: {}, template: value };
			let res = await fetchClient(`${get('splashtail')}/guilds/${guildIDValue}/execute-template`, {
				auth: creds?.token,
				method: 'POST',
				body: JSON.stringify(req)
			});
			if (!res.ok) throw new Error(await res.error('', 'markdown'));
			let resp: ExecuteTemplateResponse = await res.json();

			let str = JSON.stringify(resp);

			if (resp.Ok) {
				str = `SUCCESS!\n\r\n${(resp.Ok.result?.toString() || 'nil').replaceAll('\n', '\r\n')}`;
			} else if (resp.ExecErr) {
				str = `EXECUTION ERROR:\n\n${resp.ExecErr.error.replaceAll('\n', '\r\n')}`;
			} else {
				str = `UNKNOWN ERROR:\n\n${str}`;
			}

			terminal?.write(`\r${str}\r\n`);
			running = false;
		} catch (err) {
			terminal?.write(`\r${err}\r\n`);
			running = false;
		}
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
