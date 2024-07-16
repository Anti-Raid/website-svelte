<script lang="ts">
	import logger from '$lib/ui/logger';
	import { NoticeProps } from '../common/noticearea/noticearea';
	import NoticeArea from '../common/noticearea/NoticeArea.svelte';
	import Label from './Label.svelte';

	// Needed props
	export let acceptableTypes: string[];
	export let id: string;
	export let label: string;

	// Can be bound to
	export let file: File;
	export let fileName: string = '';
	export let fileMimeType: string = '';
	export let fileUploaded: boolean = false;
	export let disabled: boolean = false;

	// Notice area to store errors in
	let noticeArea: NoticeProps | null;

	let fileList: FileList;
	const readFile = () => {
		if (disabled) {
			noticeArea = {
				level: 'error',
				text: 'This input is disabled'
			};
			return;
		}
		logger.info('FileUpload', 'Reading file');
		fileUploaded = false;

		if (fileList.length > 1) {
			noticeArea = {
				level: 'error',
				text: 'Please only upload one file'
			};
			return;
		}

		let fileTmp = fileList[0];

		if (acceptableTypes.length > 0 && !acceptableTypes.includes(fileTmp.type)) {
			noticeArea = {
				level: 'error',
				text: `Please upload an ${acceptableTypes}`
			};
			return;
		}

		fileMimeType = fileTmp.type;
		fileName = fileTmp.name;
		file = fileTmp;

		fileUploaded = true;
	};

	$: if (fileList) {
		readFile();
	}
</script>

<div class="file-upload">
	{#if noticeArea}
		<NoticeArea props={noticeArea} />
	{/if}

	<Label {id} {label} />
	<br />
	<input
		accept={acceptableTypes.length > 0 ? acceptableTypes.join(', ') : null}
		bind:files={fileList}
		on:change={() => readFile()}
		{id}
		name={id}
		type="file"
		multiple={false}
		{disabled}
		aria-disabled={disabled}
	/>
</div>
