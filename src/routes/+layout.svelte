<script>
	import '../app.css';
	import 'sweetalert2/dist/sweetalert2.min.css';
	import Header from '../components/Header.svelte';
        import { browser } from '$app/environment';
	import Nightmare from '../components/Nightmare.svelte';

        if (browser) window.$crisp=[];window.CRISP_WEBSITE_ID="6afed643-3d77-491b-879b-ff1098026756";(function(){d=document;s=d.createElement("script");s.src="https://client.crisp.chat/l.js";s.async=1;d.getElementsByTagName("head")[0].appendChild(s);})();
	
        export let data;
</script>

<Header user={data.user || null} />

<Nightmare
	Title="Home"
	Description="This website is extremely experimental, and should not be used by the public at this time."
/>

<div class="m-4">
	<slot />
</div>
