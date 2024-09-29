<script lang="ts">
	import { PageData } from './$types';
    import Debug from '../../components/common/Debug.svelte';
    import CreatePost from '../../components/forums/CreatePost.svelte';

	export let data: PageData;
</script>

{#if data.token}
    {#if data.user}
        {#if data.user.state === "ACTIVE"}
            <CreatePost Token={data.token} />
        {/if}
    {/if}
{/if}

<Debug data={data} />