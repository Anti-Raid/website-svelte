<script lang="ts">
	import { SettingsExecute } from '$lib/generated/types';
	import { settingsFetchQueue } from '$lib/ui/settings';
	import Icon from '@iconify/svelte';
	import BoxButton from '../../inputs/button/BoxButton.svelte';
	import Message from '../../Message.svelte';

	export let guildId: string;
	export let value: string;

	let offset: number = 0;

	const templateList = async (limit: number, offset: number) => {
		let payload: SettingsExecute = {
			operation: 'View',
			module: 'settings',
			setting: 'guild_templates',
			fields: {
				__limit: limit,
				__offset: offset
			}
		};

		const settings = await settingsFetchQueue.addToQueue(guildId, payload);

		return settings;
	};
</script>

{#await templateList(10, offset)}
	<p>Loading...</p>
{:then settings}
	{#each settings.fields as fields}
		<details
			id={`setting-schema-details`}
			class="setting-schema__details border p-2 bg-black hover:bg-slate-900"
		>
			<summary class="setting-schema__summary hover:cursor-pointer break-words"
				>{fields['name']}</summary
			>

			{#if value == fields['name']}
				<BoxButton
					onclick={() => {
						value = fields['name'];
					}}>Select</BoxButton
				>
			{:else}
				<p>
					<Icon icon="mdi:check" />
					Selected
				</p>
			{/if}
		</details>
	{/each}
{:catch err}
	<Message type="error"><strong>Error</strong>{@html err?.message || err}</Message>
{/await}
