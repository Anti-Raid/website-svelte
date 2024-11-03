<script lang="ts">
	import logger from '$lib/ui/logger';
	import NoticeArea from '@components/common/noticearea/NoticeArea.svelte';
	import {
		NoticeAreaLevels,
		noticeAreaLevelsArray
	} from '@components/common/noticearea/noticearea';
	import BoolInput from '@components/inputs/BoolInput.svelte';
	import InputText from '@components/inputs/InputText.svelte';
	import Select from '@components/inputs/select/Select.svelte';

	let text: string = 'Test';
	let level: NoticeAreaLevels = 'info';
	let disabled: boolean = false;
	let className: string = '';
</script>

<InputText
	id="text"
	label="Text"
	placeholder="Text..."
	minlength={0}
	showErrors={false}
	bind:value={text}
/>

<InputText
	id="className"
	label="Class Name"
	placeholder="Class Name..."
	minlength={0}
	showErrors={false}
	bind:value={className}
/>

<Select
	id="level"
	label="Level"
	choices={noticeAreaLevelsArray.map((v) => {
		return {
			id: v,
			value: v,
			label: v
		};
	})}
	bind:value={level}
	onChange={() => logger.debug('NoticeArea.Select', 'onChange', level)}
/>

<BoolInput
	id="disabled"
	label="Disabled"
	value={disabled}
	onChange={(v) => (disabled = v)}
	disabled={false}
	description="Disable the notice area"
/>

<NoticeArea
	props={{
		text,
		level,
		disabled,
		className
	}}
/>
