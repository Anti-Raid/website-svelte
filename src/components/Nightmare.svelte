<script lang="ts">
    import Logo from "$lib/assets/logo.webp";

    export let Title: string;
    export let Description: string;
    export let Image: string = Logo;
</script>

<svelte:head>
    <title>{Title}</title>
    <meta property="og:title" content="{Title} - AntiRaid" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://antiraid.xyz" />
    <meta property="og:image" content={Image} />
    <meta property="og:description" content={Description} />
</svelte:head>