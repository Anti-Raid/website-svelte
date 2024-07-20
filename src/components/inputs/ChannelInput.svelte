<script lang="ts">
	import { Channel } from '$lib/generated/discordgo';
	import Select from './select/Select.svelte';

	export let channels: Channel[];
	export let allowed_types: number[];

	/**
	 * The selected Channel ID
	 */
	export let value: string;

	let selectedChannel: Channel;

	$: if (value) {
		let chan = channels.find((channel) => channel.id === value);

		if (chan) {
			selectedChannel = chan;
		}
	}
</script>

<Select
	id="channel"
	label="Channel"
	description="Select the channel you want to use"
	choices={channels.map((channel) => ({
		id: channel.id,
		value: channel.id,
		label: channel.name,
		disabled: !allowed_types.includes(channel.type)
	}))}
	required
	bind:value
/>
