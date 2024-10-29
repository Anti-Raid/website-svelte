<script lang="ts">
	import logger from '$lib/ui/logger';
	import { browser } from '$app/environment';
	import { NoticeProps } from '../common/noticearea/noticearea';
	import NoticeArea from '../common/noticearea/NoticeArea.svelte';
	import BoxButton from './button/BoxButton.svelte';
	import Label from './Label.svelte';

	export let acceptableTypes: string[];
	export let id: string;
	export let label: string;
	export let file: File;
	export let fileName: string = '';
	export let fileMimeType: string = '';
	export let fileUploaded: boolean = false;
	export let disabled: boolean = false;

	let noticeArea: NoticeProps | null;
	let fileList: FileList;

	const readFile = () => {
		if (disabled)
			noticeArea = {
				level: 'error',
				text: 'This input is disabled'
			};

		logger.info('FileUpload', 'Reading file');
		fileUploaded = false;

		if (fileList.length > 1)
			noticeArea = {
				level: 'error',
				text: 'Please only upload one file'
			};

		let fileTmp = fileList[0];
		if (acceptableTypes.length > 0 && !acceptableTypes.includes(fileTmp.type))
			noticeArea = {
				level: 'error',
				text: `Please upload an ${acceptableTypes}`
			};

		fileMimeType = fileTmp.type;
		fileName = fileTmp.name;
		file = fileTmp;

		fileUploaded = true;
	};

	const openFileBtn = () => {
		if (browser) {
			const element: HTMLInputElement = document.getElementById(`${id}-input`) as HTMLInputElement;
			element?.click();
		}
	};

	$: if (fileList) readFile();
</script>

<div class="file-upload">
	{#if noticeArea}
		<NoticeArea props={noticeArea} />
	{/if}

	<Label {id} {label} />
	<BoxButton onClick={openFileBtn}>Upload File!</BoxButton>

	<input
		class="hidden"
		accept={acceptableTypes.length > 0 ? acceptableTypes.join(', ') : null}
		bind:files={fileList}
		on:change={() => readFile()}
		id="{id}-input"
		name={id}
		type="file"
		multiple={false}
		{disabled}
		aria-disabled={disabled}
	/>
</div>
