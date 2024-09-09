<script lang="ts">
	import Icon from '@iconify/svelte';

	export let big = false;
	export let type: 'loading' | 'info' | 'error' | 'success';

        let icon = '';
        let color = '';
        if (type === 'loading') {
           icon = 'loading';
           color = 'white';
        }
        if (type === 'info') {
           icon = 'information';
           color = 'blue'
        }
        if (type === 'error') {
           icon = 'alert';
           color = 'red';
        }
        if (type === 'success') {
           icon = 'check';
           color = 'green';
        }
</script>

<div class="{color === 'white' ? 'text-white' : `text-{color}-500`} text-{big ? '4xl text-center': '2xl'}">
   <Icon icon="mdi:{icon}" class="animate-spin {big ? 'block m-auto ' : 'inline-block text-2xl'}" />
   <slot />
</div>
