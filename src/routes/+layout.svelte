<script>
	import '../app.css';
	import 'sweetalert2/dist/sweetalert2.min.css';
	import Header from '../components/Header.svelte';
        import Crisp from '../components/Crisp.svelte';
	import Nightmare from '../components/Nightmare.svelte';

        export let data;
</script>

<Header user={data.user || null} />

{#if data.user}
   <Crisp nickname={data.user.discordUser.username} avatar="https://cdn.discordapp.com/avatars/{data.user.id}/{data.user.discordUser.avatar}" />
{/if}

<Nightmare
	Title="Home"
	Description="This website is extremely experimental, and should not be used by the public at this time."
/>

<div class="m-4">
	<slot />
</div>
