<script lang="ts">
	import { PageData } from './$types';
	import Debug from '../../components/common/Debug.svelte';
	import CreatePost from '../../components/forums/CreatePost.svelte';
	import PostCard from '../../components/forums/PostCard.svelte';

	export let data: PageData;
</script>

{#if data.token}
	{#if data.user}
		{#if data.user.state === 'ACTIVE'}
			<CreatePost Token={data.token} />
		{/if}
	{/if}
{/if}

{#if data.posts}
	{#each data.posts as post}
		<PostCard User={post.user} Post={post} AuthedUser={data.user} Token={data.token} />
	{/each}
{/if}

<Debug {data} />
