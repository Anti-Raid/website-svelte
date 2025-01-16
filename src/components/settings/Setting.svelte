<script lang="ts" context="module">
	export enum Goto {
		Previous,
		Current,
		Next
	}
</script>

<script lang="ts">
	import { CanonicalConfigOption } from '$lib/generated/types';
	import { SettingsExecute, UserGuildBaseData } from '$lib/generated/types';
	import Label from '../inputs/Label.svelte';
	import Message from '../Message.svelte';
	import SettingsView from './SettingsView.svelte';
	import { settingsFetchQueue } from '$lib/ui/settings';

	export let configOpt: CanonicalConfigOption;
	export let guildData: UserGuildBaseData;
	export let guildId: string;
	export let filters: Record<string, any> = {}; // Any filters to apply

	let prevPageData: any = null;
	let nextPageData: any = null;
	let maximumReached: boolean = false;

	let goto = Goto.Current;

	const getCurrentSettings = async (goto: Goto) => {
		let fields = filters;

		if (goto === Goto.Previous && prevPageData) {
			fields = { ...fields, ...prevPageData };
		} else if (goto === Goto.Next && nextPageData) {
			fields = { ...fields, ...nextPageData };
		}

		let payload: SettingsExecute = {
			operation: 'View',
			setting: configOpt.id,
			fields
		};

		const settings = await settingsFetchQueue.addToQueue(guildId, payload);

		let lastField = settings?.fields?.[settings.fields.length - 1];
		if (lastField?.['__prev']) {
			prevPageData = lastField['__prev'];
		} else {
			prevPageData = null;
		}

		if (lastField?.['__next']) {
			nextPageData = lastField['__next'];
		} else {
			nextPageData = null;
		}

		if (lastField?.['__maximum']) {
			maximumReached = true;
		} else {
			maximumReached = false;
		}

		return settings;
	};
</script>

<Label id={configOpt.id} label={configOpt.name} />
<p class="text-md mb-2 opacity-80">{@html configOpt.description}</p>

{#await getCurrentSettings(goto)}
	<p>Loading...</p>
{:then settings}
	<SettingsView
		{configOpt}
		{guildData}
		{guildId}
		{settings}
		bind:goto
		prevPageAvailable={prevPageData != null}
		nextPageAvailable={nextPageData != null}
		atMaximum={maximumReached}
	/>
{:catch err}
	<Message type="error"><strong>Error</strong>{@html err?.message || err}</Message>
{/await}
