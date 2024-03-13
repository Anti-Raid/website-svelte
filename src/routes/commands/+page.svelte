<script lang="ts">
	import Message from "../../components/Message.svelte";
	import { makeSharedRequest, opGetClusterHealth } from '$lib/fetch/ext';
	import CommandList from '../../components/common/CommandList.svelte';
</script>	

<h2 class="text-4xl font-bold tracking-tight text-gray-900">
	<span class="block text-white xl:inline">Command List</span>
</h2>	

{#await makeSharedRequest(opGetClusterHealth)}
	<Message type="loading">Fetching command list</Message>
{:then data}
	<CommandList instanceList={data} />
{:catch err}
	<Message type="error">Error loading cluster data: {err}</Message>
{/await}