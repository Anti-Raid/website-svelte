<script>
    export let data;
</script>

<div class="servers">
    {#each data.user.guilds as guild}
        <div class="guild">
            <h1>{guild.name}</h1>
        </div>
    {/each}
</div>