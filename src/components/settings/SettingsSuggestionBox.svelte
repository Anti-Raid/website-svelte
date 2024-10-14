<script lang="ts">
	import { getAuthCreds } from '$lib/auth/getAuthCreds';
	import { get } from '$lib/configs/functions/services';
	import { fetchClient } from '$lib/fetch/fetch';
	import {
		CanonicalColumn,
		CanonicalConfigOption,
		CanonicalModule
	} from '$lib/generated/silverpelt';
	import { SettingsExecute, SettingsExecuteResponse } from '$lib/generated/types';
	import logger from '$lib/ui/logger';
	import { templateToStringLite, OperationTypes, settingsFetchQueue } from '$lib/ui/settings';
	import NoticeArea from '../common/noticearea/NoticeArea.svelte';
	import Message from '../Message.svelte';
	import SettingsSuggestionInput from './SettingsSuggestionInput.svelte';

	export let modules: Record<string, CanonicalModule>;
	export let guildId: string;
	export let module: CanonicalModule;
	export let configOpt: CanonicalConfigOption;
	export let operationType: OperationTypes;
	export let column: CanonicalColumn;

	const getSettingsReference = async (guildId: string, moduleId: string, configOpt: string) => {
		let referredModule = modules[moduleId];

		if (!referredModule) {
			throw new Error(`Module ${moduleId} not found in modules`);
		}

		let referredConfigOpt = referredModule.config_options.find((config) => config.id === configOpt);

		if (!referredConfigOpt) {
			throw new Error(`Config option ${configOpt} not found in module ${moduleId}`);
		}

		let payload: SettingsExecute = {
			operation: 'View',
			module: module.id,
			setting: configOpt,
			fields: {} // TODO: Add filters
		};

		const settings = await settingsFetchQueue.addToQueue(guildId, payload);

		let suggestions = settings?.fields?.map((fields) => {
			return {
				id: fields[referredConfigOpt.primary_key],
				label: templateToStringLite(referredConfigOpt.title_template, fields),
				value: fields[referredConfigOpt.primary_key]
			};
		});

		return suggestions;
	};

	// This stores the value of the field and should be binded to
	export let value: any;
	let dummyValue = ''; // needed for select suggestions to work

	$: logger.info('SettingsSuggestionBox', {
		guildId,
		module,
		configOpt,
		operationType,
		column,
		value
	});

	// For better UX, we switch between buttons and select when the number of suggestions is too large
	const maxElementsForButtons = 20;
</script>

{#if column.suggestions.Static}
	<div class="configopts-suggestions--static">
		<SettingsSuggestionInput
			{column}
			bind:value
			suggestions={column.suggestions.Static.suggestions.map((suggestion) => {
				return {
					id: suggestion,
					label: suggestion,
					value: suggestion
				};
			})}
		/>
	</div>
{:else if column.suggestions.SettingsReference}
	{#await getSettingsReference(guildId, column.suggestions.SettingsReference.module, column.suggestions.SettingsReference.setting)}
		<Message type="loading">Loading suggestions...</Message>
	{:then suggestions}
		<div class="configopts-suggestions--settingsreference">
			<SettingsSuggestionInput {column} bind:value {suggestions} />
		</div>
	{:catch err}
		<NoticeArea
			props={{
				text: err?.message || err?.toString() || 'Failed to fetch suggestions',
				level: 'error'
			}}
		/>
	{/await}
{/if}
