<script lang="ts">
import type { comments, users } from '../../types/forums/types.interface';

	export let User: users;
	export let Comment: comments;

	const ImageLoadError = (err: any) => {
		err.target.src = '/logo.png';
	};
</script>

<div
	class="block max-w-sm p-4 border rounded-lg shadow bg-surface-800 border-surface-700 hover:bg-surface-700"
>
	<a href="/forums/@{User.usertag}">
		<h2 class="flex">
			<img
				class="h-8 rounded-full"
				src={User.avatar}
				height="30px"
				width="30px"
				alt="{User.name}'s Avatar"
				on:error={ImageLoadError}
			/>
			<p class="ml-2 mt-1 mb-1 font-bold text-primary-400">{User.usertag}</p>
		</h2>
	</a>

	<div class="p-2" />

	<h5 class="mb-2 text-base font-bold overflow-x-auto tracking-tight text-primary-400">
		{Comment.caption}
	</h5>

	{#if Comment.image}
		<img src={Comment.image} alt="Comment Card" height="120px" width="120px" loading="lazy" />
	{/if}
</div>
