<script lang="ts">
	export let title: string;
	export let description: string = "AntiRaid offers powerful, automated protection for your Discord server. Designed to combat spam, harmful bots, and disruptive behavior, our advanced moderation technology ensures a safe and welcoming environment. With AntiRaid, you can focus on engaging with your community while we handle the security, providing real-time defense against potential threats. Invite AntiRaid today for reliable and effortless server protection.";
	export let image: string = '/logo.webp';
</script>

<svelte:head>
	<title>{title}</title>
	<meta property="og:title" content={title} />
	<meta property="og:site_name" content="AntiRaid" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://antiraid.xyz" />
	<meta property="og:image" content={image} />
	<meta property="og:description" content={description} />
</svelte:head>
