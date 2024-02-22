<script lang="ts">
	import { goto } from "$app/navigation";
	import { getAuthCreds } from "$lib/auth/getAuthCreds";
	import { get } from "$lib/configs/functions/services";
	import { makeSharedRequest, opGetClusterHealth } from "$lib/fetch/ext";
	import { fetchClient } from "$lib/fetch/fetch";
	import { ApiError, UserGuildBaseData } from "$lib/generated/types";
	import { getClusterOfShard, getShardIDFromGuildID } from "$lib/mewext/mewext";
	import { formatApiError } from "$lib/ui/error";
    import Message from "../../../components/Message.svelte";

    let currentState = "Loading dashboard data"

    const loadGuildData = async () => {
        let authCreds = getAuthCreds();

        if(!authCreds) throw new Error("No auth credentials found")

        let searchParams = new URLSearchParams(window.location.search);

        let guildId = searchParams.get("id");

        if(!guildId) {
            await goto("/dashboard")
            return null
        }

        currentState = "Fetching guild data"

        let res = await fetchClient(`${get('splashtail')}/users/${authCreds?.user_id}/guilds/${guildId}`, {
            auth: authCreds?.token,
            onRatelimit: (n, err) => {
                if(!n) {
                    currentState = "Retrying fetching of guild data"
                } else {
                    currentState = `${err?.message} [retrying again in ${n/1000} seconds]`
                }
            },
        })

        if (!res.ok) {
            let err: ApiError = await res.json()
            throw new Error(formatApiError("Failed to fetch base guild data", err))
        }

        let guildData: UserGuildBaseData = await res.json()

        currentState = "Fetching cluster health and metadata"

        let clusterMeta = await makeSharedRequest(opGetClusterHealth)

        currentState = "Fetching cluster modules for guild"

        let [guildShardId, err] = getShardIDFromGuildID(guildId, clusterMeta.Instances.length)

        if(err) {
            throw err
        }

        let guildClusterId = getClusterOfShard(guildShardId, clusterMeta.Map)

        return {
            guildData,
            clusterMeta,
            guildShardId,
            guildClusterId
        }
    }
</script>

{#await loadGuildData()}
    <Message
        type="loading"
    >
        Loading dashboard
    </Message>
    <small>
        <span class="font-semibold">Current State: </span>
        {currentState}
    </small>
{:then r}
    {#if r}
        <section class="guild-basic-details border"> 
            <!--Avatar-->
            <img loading="lazy" src={r.guildData.icon} alt="" />
            <!--Guild Name-->
            <h1 class="text-2xl font-semibold">{r.guildData.name}</h1>
        </section>
    {:else}
        <Message type="loading">Please wait</Message>
    {/if}
{:catch err}
    <Message type="error">Error loading dashboard data: {err}</Message>
{/await}