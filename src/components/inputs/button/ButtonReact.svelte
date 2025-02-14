<!--
From Infinity-Next commit 5317beadeeb039afe94f0a3027424c6322e64d40 

filename: src/components/layouts/Button.tsx

Converted to SvelteKit from NextJS for panel use

=> Reactive button 
-->

<script lang="ts">
	import Icon from '@iconify/svelte';
	import { NoticeProps } from '../../common/noticearea/noticearea';
	import type { States } from './states';

	let className: string = '';
	export { className as class };
	export let icon: string;
	export let text: string;
	export let type: 'button' | 'submit' = 'submit';
	export let states: States;
	export let disableBtnAfter: string = '';
	export let onClick: () => Promise<void>;
	export let noticeProps: NoticeProps | null;

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
	export let display: Display = { icon, text, className, disabled: false }; // Current display of the button

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
			noticeProps = null; // Clear any previous errors
		} catch (err) {
			noticeProps = {
				level: 'error',
				text: err?.toString() || 'An error occurred'
			};
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
	<div
		class={'flex items-center w-full text-left' + (className ? ' ' + className : '')}
		aria-live="polite"
	>
		<div
			class="bg-surface-700 hover:bg-surface-600 px-4 py-2 rounded-l-full text-white align-middle"
		>
			<Icon
				{icon}
				inline={true}
				class={'inline-flex text-white align-items items-center justify-center' +
					(icon == 'mdi:loading' ? ' animate-spin' : '')}
			/>
		</div>

		<div
			class="bg-surface-600 hover:bg-surface-500 w-half px-4 py-2 rounded-r-md text-white text-left"
		>
			<p class="line-clamp-1 text-white">{text}</p>
		</div>
	</div>
</button>
