<script lang="ts">
	export let data: any;

	import Nightmare from '../../../components/Nightmare.svelte';
	import StepProgress from '../../../components/StepProgress.svelte';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	const ImageLoadError = (a: any) => {
		a.target.src = '/logo.png';
	};

	const CheckPerm = (permissions: any, owner: Boolean) => {
		if (permissions['Administrator'] || permissions['ManageGuild'] || owner === true) return true;
		else return false;
	};

	export let guild = data.user.guilds.find(
		(i: any) => i.id === data.slug && CheckPerm(i.permissions, i.owner)
	);

	let PageURL: String = '';
	onMount(() => (PageURL = `${window.location.protocol}//${window.location.host}`));

	let Steps = [
		{
			ID: 0,
			Name: 'Invite',
			Current: true,
			Completed: false,
			AllowBack: true,
			Validate: () => {
				if (
					$page.url.searchParams.get('complete_invite') &&
					$page.url.searchParams.get('complete_invite') === 'true'
				)
					return {
						Result: true,
						Instructions: ''
					};
				else
					return {
						Result: false,
						Instructions: 'Invite AntiRaid to your server!'
					};
			}
		},
		{
			ID: 1,
			Name: 'Basic',
			Current: false,
			Completed: false,
			AllowBack: true,
			Validate: () => {
				return {
					Result: true,
					Instructions: ''
				};
			}
		},
		{
			ID: 2,
			Name: 'Advanced',
			Current: false,
			Completed: false,
			AllowBack: true,
			Validate: () => {
				return {
					Result: true,
					Instructions: ''
				};
			}
		}
	];

	const client_id = '858308969998974987';
	const state = JSON.stringify({
		session: crypto.randomUUID().replaceAll('-', ''),
		guild_id: guild.id,
		nextStep: 1
	});
</script>

{#if data.user}
	{#if guild}
		<Nightmare Title="Invite" Description="Invite AntiRaid into {guild.name}." />

		<div class="flex justify-center items-center mb-2">
			<img
				class="h-8 w-8 rounded-md"
				src="https://cdn.discordapp.com/icons/{guild.id}/{guild.icon}.png"
				height="32px"
				width="32px"
				alt="{guild.name}'s Server Image"
				on:error={ImageLoadError}
			/>

			<h3 class="ml-2 text-xl font-extrabold text-black dark:text-white truncate hover:underline">
				{guild.name}
			</h3>
		</div>

		<StepProgress bind:steps={Steps}>
			{#if Steps.findIndex((p) => p.Current) === 0}
				<p class="text-2xl text-white font-semibold text-center md:text-3xl md:text-left">
					First, Let's invite AntiRaid!
				</p>
				<p class="text-xs text-white font-semibold text-center md:text-sm md:text-left">
					Note: The "Administrator" permission is required for AntiRaid to properly function.
				</p>

				<p class="mt-3 text-sm text-white font-semibold text-center md:text-lg md:text-left">
					Once you invite the bot to your Discord Server, you will be redirected back here to
					continue setup!
				</p>

				<div class="flex justify-center items-center md:justify-normal md:items-start">
					<a
						class="mt-2 bg-indigo-600 px-3 py-2 text-white rounded-md text-base font-medium hover:cursor-pointer hover:bg-indigo-400"
						href="https://discord.com/api/oauth2/authorize?client_id={client_id}&response_type=code&permissions=8&scope=bot%20applications.commands&guild_id={guild.id}&disable_guild_select=true&state={state}&redirect_uri={PageURL}/invite/complete&prompt=consent"
						>Invite Now</a
					>
				</div>
			{/if}

			{#if Steps.findIndex((p) => p.Current) === 1}
				<h2 class="text-white font-black text-xl">First, Let's get some basic information!</h2>
			{/if}

			{#if Steps.findIndex((p) => p.Current) === 2}
				<h2 class="text-white font-black text-xl">Now, Let's get some advanced information!</h2>
			{/if}

			{#if Steps[Steps.findIndex((p) => p.ID === 2)].Completed === true}
				<h2 class="text-white font-black text-base">Finished</h2>
			{/if}
		</StepProgress>
	{:else}
		<Nightmare Title="Invite" Description="Invite AntiRaid into your server." />
		<h1 class="text-white font-bold">You don't have permissions to invite us to this guild.</h1>
	{/if}
{:else}
	<Nightmare Title="Invite" Description="Invite AntiRaid into your server." />
	<h1 class="text-white font-bold">You are not logged in. Please login and reload this page.</h1>
{/if}
