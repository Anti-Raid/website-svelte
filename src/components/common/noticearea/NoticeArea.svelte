<script lang="ts">
	/**
	 * @title NoticeArea
	 * @description NoticeArea provides a nice looking box with an icon and text with animations, inspired by Discord's old notification system
	 **/

	import Icon from '@iconify/svelte';
	import { Display, NoticeProps, getDisplay } from './noticearea';

	export let props: NoticeProps;

	let display: Display = getDisplay(props.level, props.className, props.disabled); // Current display of the area

	$: display = getDisplay(props.level, props.className, props.disabled);
</script>

<div
	class={'flex w-full box-border items-center gap-x-2.5 rounded-lg p-2.5 mx-[0] my-[20px] border text-xl bg-opacity-10 break-all' +
		(display.className ? ' ' + display.className : '') +
		(display.borderColor ? ' ' + display.borderColor : '') +
		(display.innerBackgroundColor ? ' ' + display.innerBackgroundColor : '')}
>
	<Icon
		icon={display.icon}
		class={`text-3xl ${display.borderColor} shrink-0 rounded-full overflow-hidden` +
			(display.iconColor ? ' ' + display.iconColor : '')}
	/>
	<div class="text-slate-100">
		{#if props.disable_html}{props.text}{:else}{@html props.text}{/if}
	</div>
</div>
