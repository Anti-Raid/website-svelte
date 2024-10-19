<script lang="ts">
	import Meta from '../../components/Meta.svelte';
	import Breadcrumb from '../../components/Breadcrumb.svelte';

	const docs: {
		name: string;
		href: string;
	}[] = [
		{
			name: 'Terms of Service',
			href: '/legal/terms'
		},
		{
			name: 'Privacy Policy',
			href: '/legal/privacy'
		}
	];
</script>

<Meta
	title="Legal"
	description="This page provides some links to our legal policy pages such as our Terms of Service."
/>

<Breadcrumb
	Title="Legal"
	Description="This page provides some links to our legal policy pages such as our Terms of Service."
/>

<div class="p-4" />

<div id="legal">
	{#each docs as Doc}
		<a class="text-green-600 font-bold" href={Doc.href}>{Doc.name}</a>
		<div class="p-2" />
	{/each}
</div>
