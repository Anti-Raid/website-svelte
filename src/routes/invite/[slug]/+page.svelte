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
      <h1 class="text-white">You have permissions to invite us to this guild.</h1>
   {:else}
      <h1 class="text-white">You don't have permissions to invite us to this guild.</h1>
   {/if}

   {:else}
      <h1 class="text-white">You are not logged in. Please login and reload this page.</h1>
{/if}
