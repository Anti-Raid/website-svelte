<script lang="ts">
	export let data: any;

	import ServerCard from '../../../components/ServerCard.svelte';
	import Nightmare from '../../../components/Nightmare.svelte';

	const CheckPerm = (permissions: any, owner: Boolean) => {
		if (permissions['Administrator'] || permissions['ManageGuild'] || owner === true) return true;
		else return false;
	};

	export let guild = data.user.guilds.find(
		(i: any) => i.id === data.slug && CheckPerm(i.permissions, i.owner)
	);
</script>

{#if data.user}
	{#if guild}
		<Nightmare Title="Invite" Description="Invite AntiRaid into {guild.name}." />

		<ServerCard
			name="guild"
			title={guild.name}
			description="Let's get you started!"
			image="https://cdn.discordapp.com/icons/{guild.id}/{guild.icon}.png"
			button={null}
		/>
	{:else}
		<Nightmare Title="Invite" Description="Invite AntiRaid into your server." />

		<h1 class="text-white">You don't have permissions to invite us to this guild.</h1>
	{/if}
{:else}
	<Nightmare Title="Invite" Description="Invite AntiRaid into your server." />

	<h1 class="text-white">You are not logged in. Please login and reload this page.</h1>
{/if}
