<script>
    import Card from "../../components/Card.svelte";
    export let data;
</script>

{#if data.user}
    <div class="servers">
        {#each data.user.guilds as guild}
            {#if guild.owner === true}
                <Card name="guild" title={guild.name} description="You are the owner of this server, you should have enough permissions to invite us into your server!" image="https://cdn.discordapp.com/icons/{guild.id}/{guild.icon}.png" button={null} />
            {:else if guild.permissions["Administrator"] === true}
                <Card name="guild" title={guild.name} description="You have enough permissions to invite us to this server!" image="https://cdn.discordapp.com/icons/{guild.id}/{guild.icon}.png" button={null} />
            {:else if guild.permissions["ManageGuild"] === true}
                <Card name="guild" title={guild.name} description="You have enough permissions to invite us to this server!" image="https://cdn.discordapp.com/icons/{guild.id}/{guild.icon}.png" button={null} />
            {:else}
                <Card name="guild" title={guild.name} description="You do not have enough permissions to invite us to this server!" image="https://cdn.discordapp.com/icons/{guild.id}/{guild.icon}.png" button={null} />
            {/if}
        {/each}
    </div>

    {:else}
       <h2>You are not logged in. Please login to view this page.</h2>
{/if}
