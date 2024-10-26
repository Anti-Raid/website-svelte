<script lang="ts" context="module">
	export type ThemeSpec = Record<string, StyleSpec>;
	export type StyleSpec = {
		[propOrSelector: string]: string | number | StyleSpec | null;
	};
        export interface File {
             name: string;
             icon: string;
             open: boolean;
             downloadable: boolean;
	};
</script>

<script lang="ts">
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';
	import { basicSetup } from 'codemirror';
	import { EditorView, keymap, placeholder as placeholderExt } from '@codemirror/view';
	import { EditorState, StateEffect, type Extension } from '@codemirror/state';
	import { indentWithTab } from '@codemirror/commands';
	import { indentUnit, type LanguageSupport } from '@codemirror/language';

	/**
	 * Reduce calls to the passed function.
	 *
	 * @param func - Function to debounce.
	 * @param threshold - The delay to avoid recalling the function.
	 * @param execAsap - If true, the Function is called at the start of the threshold, otherwise the Function is called at the end of the threshold.
	 */
	export function debounce<T extends (...args: any[]) => any>(
		func: T,
		threshold: number,
		execAsap = false
	): T {
		let timeout: any;

		return function debounced(this: any, ...args: any[]): any {
			const self = this;

			if (timeout) clearTimeout(timeout);
			else if (execAsap) func.apply(self, args);

			timeout = setTimeout(delayed, threshold || 100);

			function delayed(): void {
				if (!execAsap) func.apply(self, args);
				timeout = null;
			}
		} as T;
	}

        /**
        * Update minimum line count of CodeMirror
        * @param editor - CodeMirror Editor Variable
        * @param minNumOfLines - Minimum number of Lines
        **/
        export function updateToMinNumberOfLines(editor, minNumOfLines) {
           const currentNumOfLines = editor.state.doc.lines;
           const currentStr = editor.state.doc.toString();
           if (currentNumOfLines >= minNumOfLines) return;

           const lines = minNumOfLines - currentNumOfLines;
           const appendLines = "\n".repeat(lines);

           editor.dispatch({
              changes: {from: currentStr.length, insert: appendLines}
           });
        }

	let classes = '';
	export { classes as class };
	export let value: string | null | undefined = '';

	export let basic = true;
	export let lang: LanguageSupport | null | undefined = undefined;
	export let theme: Extension | null | undefined = undefined;
	export let extensions: Extension[] = [basicSetup];
	export let useTab = true;
	export let tabSize = 2;
	export let styles: ThemeSpec | null | undefined = undefined;
	export let lineWrapping = false;
	export let editable = true;
	export let readonly = false;
	export let placeholder: string | HTMLElement | null | undefined = undefined;
	export let nodebounce = false;

        export let files: File[] = [];
        export let running: boolean = false;
	export let execute: (() => Promise<void>) | null = null;

	const is_browser = typeof window !== 'undefined';
	const dispatch = createEventDispatcher<{
		change: string;
		ready: EditorView;
		reconfigure: EditorView;
	}>();

	let element: HTMLDivElement;
	let view: EditorView;
	let update_from_prop = false;
	let update_from_state = false;
	let first_config = true;
	let first_update = true;

	$: state_extensions = [
		...get_base_extensions(
			basic,
			useTab,
			tabSize,
			lineWrapping,
			placeholder,
			editable,
			readonly,
			lang
		),
		...get_theme(theme, styles),
		...extensions
	];

	$: view && update(value);
	$: view && state_extensions && reconfigure();

	$: on_change = nodebounce ? handle_change : debounce(handle_change, 300);

	onMount(() => {
		view = create_editor_view();
		dispatch('ready', view);
                updateToMinNumberOfLines(view, 10);
	});
	onDestroy(() => view?.destroy());

	function create_editor_view(): EditorView {
		return new EditorView({
			parent: element,
			state: create_editor_state(value),
			dispatch(transaction: any) {
				view.update([transaction]);

				if (!update_from_prop && transaction.docChanged) {
					on_change();
				}
			}
		});
	}

	function reconfigure(): void {
		if (first_config) {
			first_config = false;
			return;
		}

		view.dispatch({
			effects: StateEffect.reconfigure.of(state_extensions)
		});

		dispatch('reconfigure', view);
	}

	function update(value: string | null | undefined): void {
		if (first_update) {
			first_update = false;
			return;
		}

		if (update_from_state) {
			update_from_state = false;
			return;
		}

		update_from_prop = true;
		view.setState(create_editor_state(value));
		update_from_prop = false;
	}

	function handle_change(): void {
		const new_value = view.state.doc.toString();
		if (new_value === value) return;

		update_from_state = true;
		value = new_value;
		dispatch('change', value);
	}

	function create_editor_state(value: string | null | undefined): EditorState {
		return EditorState.create({
			doc: value ?? undefined,
			extensions: state_extensions
		});
	}

	function get_base_extensions(
		basic: boolean,
		useTab: boolean,
		tabSize: number,
		lineWrapping: boolean,
		placeholder: string | HTMLElement | null | undefined,
		editable: boolean,
		readonly: boolean,
		lang: LanguageSupport | null | undefined
	): Extension[] {
		const extensions: Extension[] = [
			indentUnit.of(' '.repeat(tabSize)),
			EditorView.editable.of(editable),
			EditorState.readOnly.of(readonly)
		];

		if (basic) extensions.push(basicSetup);
		if (useTab) extensions.push(keymap.of([indentWithTab]));
		if (placeholder) extensions.push(placeholderExt(placeholder));
		if (lang) extensions.push(lang);
		if (lineWrapping) extensions.push(EditorView.lineWrapping);

		return extensions;
	}

	function get_theme(
		theme: Extension | null | undefined,
		styles: ThemeSpec | null | undefined
	): Extension[] {
		const extensions: Extension[] = [];
		if (styles) extensions.push(EditorView.theme(styles));
		if (theme) extensions.push(theme);
		return extensions;
	}
</script>

{#if is_browser}
	<div class="bg-surface-700 text-white font-bold font-monster rounded-t-md" id="navbar">
		<div class="flex justify-between items-center flex-nowrap w-full">
			<div class="flex items-center ml-2">
				<img class="h-8 w-8 rounded-full" src="/logo.webp" alt="AntiRaid Logo" />
				<h2 class="ml-1 mt-0.5 font-monster font-bold tracking-tight text-lg">ARcode</h2>
			</div>

			{#if execute}
                                {#if !running}
				<div class="flex items-center flex-shrink-0">
					<button
						class="p-2 bg-green-500 h-full font-monster font-bold rounded-r-md"
						on:click={execute}
					>
						<i class="fa fa-play mr-1" /> Execute
					</button>
				</div>
                                {:else}
                                <div class="flex items-center flex-shrink-0">
					<button
						class="p-2 bg-red-500 h-full font-monster font-bold rounded-r-md"
						on:click={() => {}}
					>
						<i class="fa fa-stop mr-1" /> Stop
					</button>
				</div>
                                {/if}
			{/if}
		</div>
	</div>
        <div class="py-2 bg-surface-600 text-white font-bold font-monster" id="files">
                {#each files as file}
                   <div class="pl-1 first:pl-2 inline-flex p-2 bg-surface-500 text-white font-bold font-monster">
                      <i class="{file.icon}" />
                      <h2 class="ml-2">{file.name}</h2>
                   </div>
                {/each}
        </div>

	<div class="codemirror-wrapper rounded-b-md h-[50%] {classes}" bind:this={element} />
{:else}
	<div class="scm-waiting {classes}">
		<div class="scm-waiting__loading scm-loading">
			<div class="scm-loading__spinner" />
			<p class="scm-loading__text">Loading editor...</p>
		</div>

		<pre class="scm-pre cm-editor">{value}</pre>
	</div>
{/if}

<style>
	.codemirror-wrapper :global(.cm-focused) {
		outline: none;
	}

	.scm-waiting {
		position: relative;
	}
	.scm-waiting__loading {
		position: absolute;
		top: 0;
		left: 0;
		bottom: 0;
		right: 0;
		background-color: rgba(255, 255, 255, 0.5);
	}

	.scm-loading {
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.scm-loading__spinner {
		width: 1rem;
		height: 1rem;
		border-radius: 100%;
		border: solid 2px #000;
		border-top-color: transparent;
		margin-right: 0.75rem;
		animation: spin 1s linear infinite;
	}
	.scm-loading__text {
		font-family: sans-serif;
	}
	.scm-pre {
		font-size: 0.85rem;
		font-family: monospace;
		tab-size: 2;
		-moz-tab-size: 2;
		resize: none;
		pointer-events: none;
		user-select: none;
		overflow: auto;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
