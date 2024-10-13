<script lang="ts">
	import { UserGuildBaseData } from '$lib/generated/types';
	import ChannelInput from './ChannelInput.svelte';
	import InputNumber from './InputNumber.svelte';
	import InputText from './InputText.svelte';
	import RoleInput from './RoleInput.svelte';
	import Select from './select/Select.svelte';
	import Spacer from './Spacer.svelte';

	export let guildData: UserGuildBaseData;
	export let value: string;
	export let disabled: boolean;
	export let required: boolean;

	interface Modifier {
		type: string;
		value: string;
		specificity?: number;
	}

	let selectedModifier: Modifier = {
		type: 'user',
		value: ''
	};

	const parseModifier = (selectedModifier: Modifier) => {
		let newValue = selectedModifier.type;

		if (selectedModifier.value) {
			newValue += '/' + selectedModifier.value;
		}

		if (selectedModifier.specificity) {
			newValue += '/' + selectedModifier.specificity;
		}

		return newValue;
	};

	const stringToModifier = (value: string): Modifier => {
		let split = value.split('/', 3);

		return {
			type: split[0],
			value: split.length > 2 && split[0] != 'global' ? split[1] : '',
			specificity: split.length > 2 ? parseInt(split[2].toString()) : 0
		};
	};

	$: {
		if (selectedModifier) {
			let parsed = parseModifier(selectedModifier);
			if (parsed != value) {
				value = parsed;
			}
		} else if (value) {
			let newModifier = stringToModifier(value);
			selectedModifier = newModifier;
		}
	}
</script>

<Select
	id="type"
	label="Modifier Type"
	bind:value={selectedModifier.type}
	choices={[
		{ id: 'user', value: 'user', label: 'User' },
		{ id: 'channel', value: 'channel', label: 'Channel' },
		{ id: 'role', value: 'role', label: 'Role' },
		{ id: 'custom', value: 'custom', label: 'Custom' },
		{ id: 'global', value: 'global', label: 'Global' }
	]}
	{required}
	{disabled}
/>

<Spacer typ="input" /><br />

{#if selectedModifier.type == 'channel'}
	<ChannelInput
		channels={guildData.channels}
		channelConstraints={{ allowed_types: [], needed_bot_permissions: '0' }}
		bind:value={selectedModifier.value}
		{required}
		{disabled}
	/>
{:else if selectedModifier.type == 'role'}
	<RoleInput
		roles={guildData.roles}
		botRoles={[]}
		bind:value={selectedModifier.value}
		{required}
		{disabled}
	/>
{:else if selectedModifier.type != 'global'}
	<InputText
		id="value"
		placeholder="E.g. User ID/Channel ID/Role ID to filter by"
		label="Modifier Value"
		bind:value={selectedModifier.value}
		{required}
		{disabled}
		showErrors={false}
		minlength={1}
	/>
{/if}

{#if selectedModifier.type == 'custom'}
	<InputNumber
		id="specificity"
		placeholder="E.g. 0-1000"
		label="Specificity"
		bind:value={selectedModifier.specificity}
		{required}
		{disabled}
		showErrors={false}
		minlength={1}
	/>
{/if}
