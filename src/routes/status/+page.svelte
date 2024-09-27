<script lang="ts">
	import Message from '../../components/Message.svelte';
	import { makeSharedRequest, opGetClusterHealth } from '$lib/fetch/ext';
	import ClusterHealth from '../../components/common/ClusterHealth.svelte';
	import Meta from '../../components/Meta.svelte';
</script>

<Meta title="Status" description="View AntiRaid's cluster status" />

<h2 class="block text-4xl text-white font-semibold tracking-tight font-monster xl:inline">
	Cluster Health
</h2>
<p class="text-white font-semibold font-cabin text-sm">
	Check the health of our clusters. Are they in good shape?
</p>

{#await makeSharedRequest(opGetClusterHealth)}
	<Message type="loading">Fetching cluster health</Message>
{:then data}
	<ClusterHealth instanceList={data} />
{:catch err}
	<Message type="error">Error loading cluster health data: {err}</Message>
{/await}
