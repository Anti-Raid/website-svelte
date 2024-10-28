<script lang="ts">
	// Regular Imports
	import { browser } from '$app/environment';

	// Etc
	import BitflagInput from '../../../components/inputs/BitflagInput.svelte';
	import BoolInput from '../../../components/inputs/BoolInput.svelte';
	import InputNumber from '../../../components/inputs/InputNumber.svelte';
	import InputText from '../../../components/inputs/InputText.svelte';
	import InputTextArea from '../../../components/inputs/InputTextArea.svelte';
	import Label from '../../../components/inputs/Label.svelte';
	import serenityPermissions from '$lib/generated/build_assets/serenity_perms.json';
	import FileUpload from '../../../components/inputs/FileUpload.svelte';
	import Select from '../../../components/inputs/select/Select.svelte';
	import SelectMulti from '../../../components/inputs/select/SelectMulti.svelte';
	import MultiInput from '../../../components/inputs/multi/simple/MultiInput.svelte';

	// Button Function
	const debugButton = () => {
		if (browser) alert('This is a debug button.');
	};

	// Value(s)
	export let textValue: string;
	export let textareaValue: string;
	export let boolValue: boolean;
	export let numberValue: number;
	export let nativePerms: string;

	// Files
	export let file: File;
	export let fileName: string;
	export let fileMimeType: string;
	export let fileUploaded: boolean;

	// Select menu input
	export let selectMenuValue: string;
	export let selectMenuMultivalue: string[];

	// Multi input
	export let multiInputValue: string[];
</script>

<div class="debug">
	<section id="text">
		<h2>Text Inputs:</h2>
		<div class="p-2" />

		<div id="regular_text">
			<InputText
				id="debug"
				label="Regular Text"
				placeholder="Debug Text"
				minlength={0}
				bind:value={textValue}
			/>
		</div>

		<div id="regular_number">
			<InputNumber
				id="debug"
				label="Regular Number"
				placeholder="Debug Number"
				minlength={0}
				bind:value={numberValue}
			/>
		</div>

		<div id="regular_textarea">
			<InputTextArea
				id="debug"
				label="Regular Textarea"
				placeholder="Debug Textarea"
				minlength={0}
				bind:value={textareaValue}
			/>
		</div>

		<!--File input-->
		<FileUpload
			id="debug"
			label="File Upload"
			bind:file
			acceptableTypes={['image/png', 'image/jpeg']}
			bind:fileName
			bind:fileMimeType
			bind:fileUploaded
		/>
	</section>

	<div class="p-2" />

	<!-- Continue with other Input Types with same layout-->
	<div id="regular_bool_input">
		<BoolInput
			id="debug"
			label="Regular Boolean"
			disabled={false}
			description="This is a boolean input."
			onChange={() => console.log('Boolean changed')}
			bind:value={boolValue}
		/>
	</div>

	<div id="regular_bitflag_input">
		<Label id="bitflag-dbg" label="Select Permissions" />
		<BitflagInput
			id="bitflag-dbg"
			bind:selectedFlags={nativePerms}
			flagDescriptors={serenityPermissions}
		/>
	</div>

	<!--Select menus-->
	<div id="dbg_select_menu">
		<Label id="select-dbg" label="Select Menu" />
		<Select
			id="select-dbg"
			label="Select an option"
			bind:value={selectMenuValue}
			choices={[
				{ value: 'option1', label: 'Option 1', id: 'option1' },
				{ value: 'option2', label: 'Option 2', id: 'option2' },
				{ value: 'option3', label: 'Option 3', id: 'option3' }
			]}
			disabled={false}
		/>
	</div>

	<div id="dbg_select_menu_multi">
		<Label id="select-dbg" label="Select Menu" />
		<SelectMulti
			id="select-dbg"
			label="Select an option"
			bind:value={selectMenuMultivalue}
			choices={[
				{ value: 'option1', label: 'Option 1', id: 'option1' },
				{ value: 'option2', label: 'Option 2', id: 'option2' },
				{ value: 'option3', label: 'Option 3', id: 'option3' }
			]}
			disabled={false}
		/>
	</div>

	<!--Multi Input-->
	<MultiInput
		id="multi-input"
		title="Multi Input Foo Title"
		label="Foo"
		bind:values={multiInputValue}
		minlength={0}
		placeholder="Add an item"
	/>

	<!--ChannelInput/RoleInput/Modifier omitted here for now as they cannot be tested without having an actual guild lookup, will be added later-->
</div>
