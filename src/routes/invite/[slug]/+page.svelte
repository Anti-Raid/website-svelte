<script>
  /** @type {import('./$types').PageData} */
  export let data;
  
  const CheckPerm = (permissions, owner) => {
    if (permissions["Administrator"] || permissions["ManageGuild"] || owner === true) return true;
    else return false;
  };

  export let guild = data.user.guilds.find((i) => i.id === data.slug && CheckPerm(i.permissions, i.owner));
</script>

{#if data.user}
   {#if guild}
      <Card
         name="guild"
	 title={guild.name}
	 description="Let's get you started!"
	 image="https://cdn.discordapp.com/icons/{guild.id}/{guild.icon}.png"
	 button={null}
      />
   {:else}
      <h1 class="text-white">You don't have permissions to invite us to this guild.</h1>
   {/if}

   {:else}
      <h1 class="text-white">You are not logged in. Please login and reload this page.</h1>
{/if}
