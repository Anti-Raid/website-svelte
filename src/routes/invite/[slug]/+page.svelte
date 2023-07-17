<script lang="ts">
	export let data: any;

	import ServerCard from '../../../components/ServerCard.svelte';
	import Nightmare from '../../../components/Nightmare.svelte';
 import StepProgress from '../../../components/StepProgress.svelte';

	const CheckPerm = (permissions: any, owner: Boolean) => {
		if (permissions['Administrator'] || permissions['ManageGuild'] || owner === true) return true;
		else return false;
	};

 let Steps = [ 
                 { 
                         ID: 0, 
                         Name: 'Get Started', 
                         Current: true, 
                         Completed: false, 
                         AllowBack: true, 
                         Validate: () => { 
                                 return true; 
                         } 
                 }, 
                 { 
                         ID: 1, 
                         Name: 'Basic', 
                         Current: false, 
                         Completed: false, 
                         AllowBack: true, 
                         Validate: () => { 
                                 return true; 
                         } 
                 }, 
                 { 
                         ID: 2, 
                         Name: 'Advanced', 
                         Current: false, 
                         Completed: false, 
                         AllowBack: true, 
                         Validate: () => { 
                                 return true; 
                         } 
                 } 
         ];

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

  
 <StepProgress bind:steps={Steps}> 
         {#if Steps.findIndex((p) => p.Current) === 0} 
                 <h2 class="text-white font-black text-xl">Let's get Started!</h2> 
         {/if} 
  
         {#if Steps.findIndex((p) => p.Current) === 1} 
                 <h2 class="text-white font-black text-xl">Let's get some basic information!</h2> 
         {/if} 
  
         {#if Steps.findIndex((p) => p.Current) === 2} 
                 <h2 class="text-white font-black text-xl"> 
                         Let's get some advanced information!
                 </h2> 
         {/if} 
  
         {#if Steps[Steps.findIndex((p) => p.ID === 2)].Completed === true} 
                 <h2 class="text-white font-black text-base">Finished</h2>
         {/if} 
 </StepProgress>
	{:else}
		<Nightmare Title="Invite" Description="Invite AntiRaid into your server." />

		<h1 class="text-white">You don't have permissions to invite us to this guild.</h1>
	{/if}
{:else}
	<Nightmare Title="Invite" Description="Invite AntiRaid into your server." />

	<h1 class="text-white">You are not logged in. Please login and reload this page.</h1>
{/if}
