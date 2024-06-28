<script lang="ts">
	import Icon from '@iconify/svelte';
	import { Display, NoticeProps, getDisplay } from './noticearea';

	export let props: NoticeProps;

	let display: Display = getDisplay(props.level, props.className, props.disabled); // Current display of the area

	$: display = getDisplay(props.level, props.className, props.disabled);
</script>

<div
	class={'flex w-full box-border items-center gap-x-2.5 rounded-lg p-2.5 mx-[0] my-[20px] border text-xl bg-opacity-10 text-slate-100 break-all' +
		(display.className ? ' ' + display.className : '') +
		(display.borderColor ? ' ' + display.borderColor : '') +
		(display.innerBackgroundColor ? ' ' + display.innerBackgroundColor : '')}
>
	<Icon
		icon={display.icon}
		class={`text-3xl ${display.borderColor} shrink-0 rounded-full overflow-hidden` +
			(display.iconColor ? ' ' + display.iconColor : '')}
	/>
	{@html props.text}
</div>
