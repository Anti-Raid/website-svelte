<script lang="ts">
	import { PageData } from './$types';
    import Debug from '../../components/common/Debug.svelte';

	export let data: PageData;
</script>

<Debug data={data} />