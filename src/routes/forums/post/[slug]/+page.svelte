<script lang="ts">
	import type { PageData } from './$types';
	import Meta from '../../../../components/Meta.svelte';
	import PostCard from '../../../../components/forums/PostCard.svelte';
	import Comment from '../../../../components/forums/Comment.svelte';
	import CreateComment from '../../../../components/forums/CreateComment.svelte';
	import Debug from '../../../../components/common/Debug.svelte';

	export let data: PageData;
</script>

{#if !data.post}
	<Meta title="Post" description="Sorry, that post does not exist in this universe!" />

	<section class="flex items-center h-full p-16 dark:bg-gray-900 dark:text-gray-100">
		<div class="container flex flex-col items-center justify-center px-5 mx-auto my-8">
			<div class="max-w-md text-center">
				<h2 class="mb-8 font-extrabold text-9xl dark:text-gray-600">
					<span class="sr-only">Error</span>404
				</h2>
				<p class="text-2xl font-semibold md:text-3xl">
					Sorry, that post does not exist here in this universe.
				</p>
				<p class="mt-4 mb-8 dark:text-gray-400">
					But, don't worry there are other posts available here!
				</p>
				<a
					rel="noopener noreferrer"
					href="/"
					class="px-8 py-3 font-semibold rounded dark:bg-violet-400 dark:text-gray-900"
					>Back Home!</a
				>
			</div>
		</div>
	</section>
{:else if data.post}
	<Meta
		title="@{data.post.user.usertag}'s Post - AntiRaid Forums"
		description="@{data.post.user.usertag} on AntiRaid Forums, posted '{data.post.caption}'."
		image={data.post.image || undefined}
	/>

	<PostCard User={data.post.user} Post={data.post} AuthedUser={data.user} Token={data.token} />

	<div id="comments" class="mt-10">
		<h2 class="text-primary-400 font-bold text-4xl text-center">Comments</h2>
		<p class="mt-1 text-primary-200 font-semibold text-base text-center">Please be nice! >3</p>

		<div class="p-2" />

		{#if data.user}
			<CreateComment PostID={data.post.postid} Token={data.token || null} />
			<div class="p-2" />
		{/if}

		{#if data.post.comments.length > 0}
			<div class="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
				{#each data.post.comments as comment}
					<div class="self-auto">
						<Comment User={comment.user} Comment={comment} />
					</div>
				{/each}
			</div>
		{:else}
			<h2 class="text-primary-400 font-bold text-md text-center">
				Sorry, there are no comments for this post yet.
			</h2>
		{/if}
	</div>

	<div class="p-2" />
	<Debug {data} />
{/if}
