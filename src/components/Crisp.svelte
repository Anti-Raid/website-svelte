<script lang="ts">
  import { onMount } from 'svelte';

  export let email: string, nickname: string, company: string, avatar: string;

  onMount(() => {
    window.$crisp = [];
    window.CRISP_WEBSITE_ID = "6afed643-3d77-491b-879b-ff1098026756";

    (function () {
      const d = document;
      const s = d.createElement('script');
      s.src = 'https://client.crisp.chat/l.js';
      s.async = 1;
      d.getElementsByTagName('head')[0].appendChild(s);
    })();

    if (email) window.$crisp.push(['set', 'user:email', [email]]);
    if (nickname) window.$crisp.push(['set', 'user:nickname', [nickname]]);
    if (company) window.$crisp.push(['set', 'user:company', [company]]);
    if (avatar) window.$crisp.push(['set', 'user:avatar', [avatar]]);
  });
</script>
