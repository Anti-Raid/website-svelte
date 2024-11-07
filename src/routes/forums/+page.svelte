<script lang="ts">
	import { PageData } from './$types';
	import Debug from '@components/common/Debug.svelte';
	import CreatePost from '@components/forums/CreatePost.svelte';
	import PostCard from '@components/forums/PostCard.svelte';
	import Meta from '@components/Meta.svelte';
	export let data: PageData;
</script>

<Meta
	title="Forums - AntiRaid"
	description="Recieve support from the community, ask questions or even hang out!"
/>

{#if data.token}
	{#if data.user}
		{#if data.user.state != 'BANNED'}
			<CreatePost Token={data.token} />
		{:else}
			<h2 class="text-white font-bold font-monster">
				You have been banned from AntiRaid Forums, due to violating community guidelines.
			</h2>
		{/if}
	{/if}
{/if}

<div class="p-2" />

{#if data.posts}
	<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
		{#each data.posts as post}
			<div class="col-span-1 h-auto p-0 m-0">
				<div class="self-auto h-auto p-0 m-0">
					<PostCard User={post.user} Post={post} AuthedUser={data.user} Token={data.token} />
				</div>
			</div>
		{/each}
	</div>
{/if}

<div class="p-2" />
<Debug {data} />
