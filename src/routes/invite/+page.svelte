<script>
    export let data;
</script>

<div class="servers">
    {#each data.user.guilds as guild}
        {#if guild.owner === true}
            <div class="guild">
                <h1>{guild.name} ({guild.id})</h1>
            </div>
        {:else if guild.permissions["Administrator"] === true}
            <div class="guild">
                <h1>{guild.name} ({guild.id})</h1>
            </div>
        {:else if guild.permissions["ManageGuild"] === true}
            <div class="guild">
                <h1>{guild.name} ({guild.id})</h1>
            </div>
        {/if}
    {/each}
</div>