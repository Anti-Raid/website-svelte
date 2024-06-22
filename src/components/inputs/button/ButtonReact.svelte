<!--
From Infinity-Next commit 5317beadeeb039afe94f0a3027424c6322e64d40 

filename: src/components/layouts/Button.tsx

Converted to SvelteKit from NextJS for panel use

=> Reactive button 
-->

<script lang="ts">
	import { error } from '$lib/toast';
	import ButtonInner from './ButtonInner.svelte';
	import type { Color } from './colors';
	import type { States } from './states';

	let className: string = '';
	export { className as class };
	export let color: Color;
	export let icon: string;
	export let text: string;
	export let type: 'button' | 'submit' = 'submit';
	export let states: States;
	export let disableBtnAfter: string = '';
	export let onClick: () => Promise<void>;

	// Internal state
	enum ReactState {
		Normal,
		Loading,
		Clicked,
		Error
	}

	interface Display {
		icon: string;
		text: string;
		className: string;
		disabled: boolean;
	}

	let state: ReactState = ReactState.Normal; // Current state of the button
	let display: Display = { icon, text, className, disabled: false }; // Current display of the button

	$: {
		switch (state) {
			case ReactState.Normal:
				display = {
					...display,
					icon,
					text,
					className
				};
				break;
			case ReactState.Loading:
				display = {
					...display,
					icon: 'mdi:loading',
					text: states.loading,
					className: (className ? className + ' ' : '') + 'cursor-not-allowed animate-pulse'
				};
				break;
			case ReactState.Clicked:
				display = {
					...display,
					icon: 'mdi:check',
					text: states.success,
					className: className + display.disabled ? 'cursor-not-allowed animate-pulse' : ''
				};

				if (!disableBtnAfter) {
					display.disabled = false;
				} else {
					display = {
						...display,
						text: disableBtnAfter,
						icon: 'mdi:refresh',
						disabled: true
					};
				}

				break;
			case ReactState.Error:
				display = {
					...display,
					icon: 'mdi:alert-circle',
					text: states.error,
					className: className + display.disabled ? 'cursor-not-allowed animate-pulse' : ''
				};
				break;
		}
	}
</script>

<button
	class="w-full"
	disabled={display.disabled}
	aria-disabled={display.disabled}
	{type}
	on:click|preventDefault
	on:click={async () => {
		if (state == ReactState.Loading || display.disabled) return;

		state = ReactState.Loading;

		try {
			await onClick();
			state = ReactState.Clicked;
		} catch (err) {
			error(err?.toString() || 'An error occurred');
			state = ReactState.Error;
		}

		// Wait 2 seconds
		if (!disableBtnAfter) {
			setTimeout(() => {
				if (states) {
					state = ReactState.Normal;
				}

				display.disabled = false;
			}, 4000);
		} else {
			display.disabled = true;
			display.text = disableBtnAfter;
		}
	}}
>
	<ButtonInner {color} icon={display.icon} text={display.text} class={display.className} />
</button>
