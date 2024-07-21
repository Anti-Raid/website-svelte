<script lang="ts">
	import serenityPermissions from '$lib/generated/build_assets/serenity_perms.json';
	import channelTypesInv from '$lib/generated/build_assets/channel_types_inv.json';
	import { BitFlag } from '$lib/bitflag';
	import Select from './select/Select.svelte';
	import { GuildChannelWithPermissions } from '$lib/generated/ext';
	import {
		ChannelTypeDM,
		ChannelTypeGuildCategory,
		ChannelTypeGuildStageVoice,
		ChannelTypeGuildVoice
	} from '$lib/generated/discordgo';
	import { ChannelConstraints } from '$lib/inputconstraints';

	export let channels: GuildChannelWithPermissions[];
	export let channelConstraints: ChannelConstraints;
	export let value: string;
	export let required: boolean = false;
	export let disabled: boolean;

	let selectedChannel: GuildChannelWithPermissions;

	const sortChannels = (channels: GuildChannelWithPermissions[]): GuildChannelWithPermissions[] => {
		// Within each category, sort based on the following principle:
		//
		// 1. Voice channels at bottom
		// 2. Position value used to sort both text and voice [but voice still appears below text]
		// 3. If category, type and position are all the same, earlier ID is first
		let categories: GuildChannelWithPermissions[] = [];
		let voiceChannels: GuildChannelWithPermissions[] = [];
		let textChannels: GuildChannelWithPermissions[] = [];

		channels.forEach((channel) => {
			if (!channel.channel) {
				return;
			}

			switch (channel.channel.type) {
				case ChannelTypeGuildCategory:
					categories.push(channel);
					break;
				case ChannelTypeGuildVoice:
					voiceChannels.push(channel);
					break;
				case ChannelTypeGuildStageVoice:
					voiceChannels.push(channel);
					break;
				default:
					textChannels.push(channel);
					break;
			}
		});

		const sort = (a: GuildChannelWithPermissions, b: GuildChannelWithPermissions) => {
			if (!a.channel || !b.channel) {
				return 0;
			}

			if (a.channel.position < b.channel.position) {
				return -1;
			} else if (a.channel.position > b.channel.position) {
				return 1;
			} else {
				// Compare by id
				if (a.channel.id < b.channel.id) {
					return -1;
				} else if (a.channel.id > b.channel.id) {
					return 1;
				} else {
					return 0;
				}
			}
		};

		categories.sort(sort);
		voiceChannels.sort(sort);
		textChannels.sort(sort);

		let sorted: GuildChannelWithPermissions[] = [];

		// First add all channels not in categories
		for (let channel of textChannels) {
			if (!channel.channel?.parent_id) {
				sorted.push(channel);
			}
		}

		// Then add categorized
		for (let category of categories) {
			sorted.push(category);

			let children = textChannels.filter(
				(channel) => channel.channel?.parent_id === category.channel?.id
			);
			children = children.concat(
				voiceChannels.filter((channel) => channel.channel?.parent_id === category.channel?.id)
			);

			sorted = sorted.concat(children);
		}

		return sorted;
	};

	$: if (value) {
		let chan = channels.find((channel) => channel?.channel?.id === value);

		if (chan) {
			selectedChannel = chan;
		}
	}
</script>

<Select
	id="channel"
	label="Channel"
	description="Select the channel you want to use"
	choices={sortChannels(channels).map((channel) => {
		if (!channel?.channel) {
			return {
				id: '',
				value: '',
				label: 'Unknown Channel',
				disabled: true
			};
		}

		let botPerms = new BitFlag(serenityPermissions, channel.bot);

		let isAllowedType = channelConstraints.allowed_types.includes(channel.channel.type);
		let hasRequiredPermission = botPerms.isFlagSet(channelConstraints.needed_bot_permissions);

		// @ts-ignore
		let channelType = channelTypesInv[channel.channel.type.toString()];

		// We only need the core types here
		switch (channel.channel.type) {
			case ChannelTypeDM:
				channelType = 'DM';
				break;
		}

		return {
			id: channel.channel.id || '',
			value: channel.channel.id,
			label: `${channel.channel.name} (${channelType})`,
			disabled: !isAllowedType || !hasRequiredPermission
		};
	})}
	{required}
	{disabled}
	bind:value
/>

{#if selectedChannel}
	<p>Selected Channel: {selectedChannel?.channel?.name || 'Unknown Channel'}</p>

	<p>
		Bot Permissions:
		{#each Object.entries(new BitFlag(serenityPermissions, selectedChannel.bot).getSetFlags()) as [name, permission]}
			{#if name != ''}
				<span class="font-semibold">{name}: </span>{permission}
			{/if}
		{/each}
	</p>
	<p>
		User Permissions:
		{#each Object.entries(new BitFlag(serenityPermissions, selectedChannel.user).getSetFlags()) as [name, permission]}
			{#if name != ''}
				<span class="font-semibold">{name}: </span>{permission}
			{/if}
		{/each}
	</p>
{/if}
