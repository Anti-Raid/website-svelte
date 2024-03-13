<script lang="ts">
	import Message from "../../components/Message.svelte";
	import { makeSharedRequest, opGetClusterHealth } from '$lib/fetch/ext';
	import ClusterHealth from '../../components/common/ClusterHealth.svelte';
	import Meta from "../../components/Meta.svelte";
</script>	

<Meta
	title="Status"
	description="View Anti-Raid's cluster status"
/>

<h2 class="text-4xl font-bold tracking-tight text-gray-900">
	<span class="block text-white xl:inline">Cluster Health</span>
</h2>	

{#await makeSharedRequest(opGetClusterHealth)}
	<Message type="loading">Fetching cluster health</Message>
{:then data}
	<ClusterHealth instanceList={data} />
{:catch err}
	<Message type="error">Error loading cluster health data: {err}</Message>
{/await}