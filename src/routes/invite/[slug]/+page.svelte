<script lang="ts">
	export let data: any;

	import Nightmare from '../../../components/Nightmare.svelte';
	import StepProgress from '../../../components/StepProgress.svelte';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	const ImageLoadError = (a: any) => {
		a.target.src = '/logo.webp';
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

	let steps = [
		{
			name: 'Invite',
			current: true,
			completed: false,
			disableBack: true,
			onClick: async () => {
				if (
					$page.url.searchParams.get('complete_invite') &&
					$page.url.searchParams.get('complete_invite') === 'true'
				) return true;
				else
					throw new Error(
						'You have not invited AntiRaid to your server. Please follow the instructions listed on the page!'
					);
			}
		},
		{
			name: 'Basic',
			current: false,
			completed: false,
			disableBack: false,
			onClick: () => {
				return true;
			}
		},
		{
			name: 'Advanced',
			current: false,
			completed: false,
			disableBack: false,
			onClick: () => {
				return true;
			}
		}
	];

	let currentStep: number = 1;

	const client_id = '858308969998974987';
	const state = JSON.stringify({
		session: crypto.randomUUID().replaceAll('-', ''),
		guild_id: guild.id,
		nextStep: 1
	});

    console.log(data);
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

		<StepProgress bind:currentStep {steps}>
			{#if currentStep == 0}
				<h1 class="text-2xl text-white font-bold tracking-tight sm:text-5xl md:text-6xl">
					First, Let's invite <span class="text-red-600">AntiRaid</span>!
				</h1>
				<p class="block text-white font-semibold xl:inline">
					Once you invite the bot to your Discord Server, you will be redirected back here to
					continue setup!
				</p>

				<div class="mt-3 p-2 bg-indigo-400 rounded-md">
					<h1 class="flex text-xl text-white font-bold tracking-tight">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="text-white mt-1 pr-2"
							height="1em"
							viewBox="0 0 384 512"
							><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path
								d="M297.2 248.9C311.6 228.3 320 203.2 320 176c0-70.7-57.3-128-128-128S64 105.3 64 176c0 27.2 8.4 52.3 22.8 72.9c3.7 5.3 8.1 11.3 12.8 17.7l0 0c12.9 17.7 28.3 38.9 39.8 59.8c10.4 19 15.7 38.8 18.3 57.5H109c-2.2-12-5.9-23.7-11.8-34.5c-9.9-18-22.2-34.9-34.5-51.8l0 0 0 0c-5.2-7.1-10.4-14.2-15.4-21.4C27.6 247.9 16 213.3 16 176C16 78.8 94.8 0 192 0s176 78.8 176 176c0 37.3-11.6 71.9-31.4 100.3c-5 7.2-10.2 14.3-15.4 21.4l0 0 0 0c-12.3 16.8-24.6 33.7-34.5 51.8c-5.9 10.8-9.6 22.5-11.8 34.5H226.4c2.6-18.7 7.9-38.6 18.3-57.5c11.5-20.9 26.9-42.1 39.8-59.8l0 0 0 0 0 0c4.7-6.4 9-12.4 12.7-17.7zM192 128c-26.5 0-48 21.5-48 48c0 8.8-7.2 16-16 16s-16-7.2-16-16c0-44.2 35.8-80 80-80c8.8 0 16 7.2 16 16s-7.2 16-16 16zm0 384c-44.2 0-80-35.8-80-80V416H272v16c0 44.2-35.8 80-80 80z"
							/></svg
						>
						NOTE
					</h1>
					<p class="mt-2 block text-white font-semibold xl:inline">
						The "<span class="text-gray-800 font-extrabold">Administrator</span>" permission is
						required for AntiRaid to properly function.
					</p>
				</div>

				<div class="p-2" />

				<div class="flex justify-center items-center md:justify-normal md:items-start">
					<a
						class="mt-2 bg-indigo-600 px-3 py-2 text-white rounded-md text-base font-medium hover:cursor-pointer hover:bg-indigo-400"
						href="https://discord.com/api/oauth2/authorize?client_id={client_id}&response_type=code&permissions=8&scope=bot%20applications.commands&guild_id={guild.id}&disable_guild_select=true&state={state}&redirect_uri={PageURL}/invite/complete&prompt=consent"
						>Invite Now</a
					>
				</div>
			{/if}

			{#if currentStep == 1}
				<h1 class="text-2xl text-white font-bold tracking-tight sm:text-5xl md:text-6xl">
					Now, Let's get some <span class="text-red-600">Basic</span> info!
				</h1>
				<p class="block text-white font-semibold xl:inline">
					Don't worry, this shouldn't be too hard and should only take a few moments!
				</p>
			{/if}

			{#if currentStep == 2}
				<h2 class="text-white font-black text-xl">Now, Let's get some advanced information!</h2>
			{/if}

			{#if currentStep == 3}
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
