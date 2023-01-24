<script>
	import '../app.css';
	import 'sweetalert2/dist/sweetalert2.min.css';
	import Header from '../components/Header.svelte';
	import Footer from '../components/Footer.svelte';

        window.$crisp=[];window.CRISP_WEBSITE_ID="6afed643-3d77-491b-879b-ff1098026756";(function(){d=document;s=d.createElement("script");s.src="https://client.crisp.chat/l.js";s.async=1;d.getElementsByTagName("head")[0].appendChild(s);})();
	
        export let data;
</script>

<Header user={data.user || null} />

<div class="m-4 flex flex-col min-h-screen">
	<slot />
</div>

<Footer />
