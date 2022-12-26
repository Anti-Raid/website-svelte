<script lang="ts">
	import Card from '../../components/Card.svelte';
	import Nightmare from '../../components/Nightmare.svelte';

	export let data: any;

	const Invite = (id: string) => {
		return {
			name: 'Invite',
			click: () => {
				window.location.href = `/invite/${id}`;
			}
		};
	};
</script>

<Nightmare Title="Invite" Description="Invite our bot into your server." />

{#if data.user}
	<div class="servers">
		{#each data.user.guilds as guild}
			{#if guild.owner === true}
				<Card
					name="guild"
					title={guild.name}
					description="You are the owner of this server, you should have enough permissions to invite us into your server!"
					image="https://cdn.discordapp.com/icons/{guild.id}/{guild.icon}.png"
					button={Invite(guild.id)}
				/>
			{:else if guild.permissions['Administrator'] === true}
				<Card
					name="guild"
					title={guild.name}
					description="You have enough permissions to invite us to this server!"
					image="https://cdn.discordapp.com/icons/{guild.id}/{guild.icon}.png"
					button={Invite(guild.id)}
				/>
			{:else if guild.permissions['ManageGuild'] === true}
				<Card
					name="guild"
					title={guild.name}
					description="You have enough permissions to invite us to this server!"
					image="https://cdn.discordapp.com/icons/{guild.id}/{guild.icon}.png"
					button={Invite(guild.id)}
				/>
			{:else}
				<Card
					name="guild"
					title={guild.name}
					description="You do NOT have enough permissions to invite us to this server!"
					image="https://cdn.discordapp.com/icons/{guild.id}/{guild.icon}.png"
					button={null}
				/>
			{/if}
		{/each}
	</div>
{:else}
	<h2 class="text-white">You are not logged in. Please login to view this page.</h2>
{/if}
