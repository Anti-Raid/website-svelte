<script>
  /** @type {import('./$types').PageData} */
  export let data;
  
  const CheckPerm = (permissions, owner) => {
    if (permissions.contains("Administrator") || permissions.contains("ManageGuild") || owner === true) return true;
    else return false;
  };

  export let guild = data.user.guilds.find((r) => { if (r.id === data.guild_id && CheckPerm(r.permissions, r.owner) === true) return true; else return false });
</script>

{#if data.user}
   {#if guild}
      <h1 class="text-white">You have permissions to invite us to this guild.</h1>

      {:else}
        <h1 class="text-white">You don't have permissions to invite us to this guild.</h1>
   {/if}

   {:else}
        <h1 class="text-white">You are not logged in. Please login and reload this page.</h1>
{/if}
