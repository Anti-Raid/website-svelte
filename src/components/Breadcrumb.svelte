<script lang="ts">
	export let Title: string = '';
	export let Description: string = '';

	const ImageLoadError = (err: any) => {
		err.target.src = '/logo.webp';
	};
</script>

<div class="flex">
	<img
		class="h-10 rounded-full"
		src="/logo.webp"
		alt="AntiRaid Logo"
		height="40px"
		width="40px"
		on:error={ImageLoadError}
	/>

	<h2 class="ml-2 text-white font-monster tracking-tight font-bold text-4xl">{Title}</h2>
</div>

<h6
	class="mt-2 ml-2 text-white/75 font-bold text-left leading-6 font-cabin text-base md:text-xl lg:text-2xl"
>
	{@html Description}
</h6>
