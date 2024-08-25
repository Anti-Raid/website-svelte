<script lang="ts">
	import serenityPermissions from '$lib/generated/build_assets/serenity_perms.json';
	import channelTypesInv from '$lib/generated/build_assets/channel_types_inv.json';
	import { BitFlag } from '$lib/bitflag';
	import { GuildChannelWithPermissions } from '$lib/generated/ext';
	import {
		ChannelTypeGuildCategory,
		ChannelTypeGuildStageVoice,
		ChannelTypeGuildVoice
	} from '$lib/generated/discordgo';
	import { ChannelConstraints } from '$lib/inputconstraints';
	import { title } from '$lib/strings';
	import RawSelect from './select/RawSelect.svelte';

	export let style: 'normal' | 'simplified' = 'normal';
	export let channels: GuildChannelWithPermissions[];
	export let channelConstraints: ChannelConstraints;
	export let value: string;
	export let required: boolean = false;
	export let disabled: boolean;

	let selectedChannel: GuildChannelWithPermissions;

	/**
	 * Within each category, sort based on the following principle:
	 * 1. Voice channels at bottom
	 * 2. Position value used to sort both text and voice [but voice still appears below text]
	 * 3. If category, type and position are all the same, earlier ID is first
	 * @param channels Channels to sort
	 * @returns Sorted channels
	 */
	const sortChannels = (channels: GuildChannelWithPermissions[]): GuildChannelWithPermissions[] => {
		let categories: GuildChannelWithPermissions[] = [];
		let voiceChannels: GuildChannelWithPermissions[] = [];
		let textChannels: GuildChannelWithPermissions[] = [];

		for (let channel of channels) {
			if (!channel.channel) continue;

			const type = channel.channel.type;
			if (type === ChannelTypeGuildCategory) categories.push(channel);
			else if (type === ChannelTypeGuildVoice || type === ChannelTypeGuildStageVoice)
				voiceChannels.push(channel);
			else textChannels.push(channel);
		}

		const sort = (a: GuildChannelWithPermissions, b: GuildChannelWithPermissions) => {
			if (!a.channel || !b.channel) return 0;

			if (a.channel.position < b.channel.position) return -1;
			else if (a.channel.position > b.channel.position) return 1;
			else {
				// Compare by id
				if (a.channel.id < b.channel.id) return -1;
				else if (a.channel.id > b.channel.id) return 1;
				else return 0;
			}
		};

		categories.sort(sort);
		voiceChannels.sort(sort);
		textChannels.sort(sort);

		let sorted: GuildChannelWithPermissions[] = [];

		// First add all channels not in categories
		for (let channel of textChannels) if (!channel.channel?.parent_id) sorted.push(channel);

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

	// Set selected channel if value is set
	$: if (value) {
		let chan = channels.find((channel) => channel?.channel?.id === value);

		if (chan) {
			selectedChannel = chan;
		}
	}

	/**
	 * ts workaround: bypass cant index type
	 */
	const _indexInv = (type: number): string => {
		// @ts-ignore
		return channelTypesInv[type];
	};
</script>

<RawSelect
	id="channel"
	choices={sortChannels(channels).map((channel) => {
		if (!channel?.channel)
			return {
				id: '',
				value: '',
				label: 'Unknown Channel',
				disabled: true
			};

		let botPerms = new BitFlag(serenityPermissions, channel.bot);

		let isAllowedType = channelConstraints.allowed_types.includes(channel.channel.type);
		let hasRequiredPermission = botPerms.isFlagSet(channelConstraints.needed_bot_permissions);

		// @ts-ignore
		let channelType = channelTypesInv[channel.channel.type.toString()];

		return {
			id: channel.channel.id,
			value: channel.channel.id,
			label: `${channel.channel.name} (${channelType})`,
			disabled: !isAllowedType || !hasRequiredPermission
		};
	})}
	{required}
	{disabled}
	bind:value
/>

<fieldset class="section grid rounded-md text-slate-200">
	<legend class="p-1 font-semibold">Allowed Channel Types</legend>
	<div class="content">
		<ul>
			{#each channelConstraints.allowed_types as type, i}
				<li class="inline text-slate-200">
					{`${title(_indexInv(type).replaceAll('_', ' '))}${
						i != channelConstraints.allowed_types.length - 1 ? ' OR ' : ''
					}`}
				</li>
			{/each}
		</ul>
	</div>
</fieldset>

<fieldset class="section grid rounded-md text-slate-200">
	<legend class="p-1 font-semibold">Needed Bot Permissions</legend>
	<div class="content">
		<ul>
			{#each Object.entries(new BitFlag(serenityPermissions, channelConstraints.needed_bot_permissions).getSetFlags()) as [name, permission], i}
				{#if name != ''}
					<li class="inline text-slate-200">
						<span class="font-semibold">{name} </span>{#if style != 'simplified'}({permission}){/if}
						{#if i != Object.entries(new BitFlag(serenityPermissions, channelConstraints.needed_bot_permissions).getSetFlags()).length - 1}
							<span class="inline text-slate-200"> AND </span>
						{/if}
					</li>
				{/if}
			{/each}
		</ul>
	</div>
</fieldset>

{#if style == 'normal' && selectedChannel}
	<p>Selected Channel: {selectedChannel?.channel?.name || 'Unknown Channel'}</p>

	<details>
		<summary class="hover:cursor-pointer">Debug</summary>
		<p>Bot Permissions</p>
		<ul>
			{#each Object.entries(new BitFlag(serenityPermissions, selectedChannel.bot).getSetFlags()) as [name, permission]}
				{#if name != ''}
					<li><span class="font-semibold">{name}: </span>{permission}</li>
				{/if}
			{/each}
		</ul>
		<p>User Permissions</p>
		<ul>
			{#each Object.entries(new BitFlag(serenityPermissions, selectedChannel.user).getSetFlags()) as [name, permission]}
				{#if name != ''}
					<li><span class="font-semibold">{name}: </span>{permission}</li>
				{/if}
			{/each}
		</ul>
	</details>
{/if}

<style>
	fieldset {
		border: 3px solid transparent;
		border-color: rgb(60 60 60 / var(--tw-text-opacity));
		box-sizing: border-box;
		grid-area: 1 / 1; /* first row, first column */
		width: inherit;
		padding: 1px;
	}
</style>
