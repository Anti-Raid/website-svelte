<script lang="ts">
	import { getAuthCreds } from '$lib/auth/getAuthCreds';
	import { get } from '$lib/configs/functions/services';
	import { fetchClient } from '$lib/fetch/fetch';
	import { CanonicalModule } from '$lib/generated/silverpelt';
	import { SettingsExecute } from '$lib/generated/types';
	import { getDispatchType } from '$lib/ui/settings';
	import { NoticeProps } from '../../../../components/common/noticearea/noticearea';
	import NoticeArea from '../../../../components/common/noticearea/NoticeArea.svelte';
	import TemplateBuilder from '../../../../components/dashboard/message_templatebuilder/TemplateBuilder.svelte';
	import ButtonReact from '../../../../components/inputs/button/ButtonReact.svelte';
	import { Color } from '../../../../components/inputs/button/colors';
	import ChannelInput from '../../../../components/inputs/ChannelInput.svelte';
	import { QuickActionProps } from './actions';

	// svelte-ignore unused-export-let
	export let props: QuickActionProps;
	// svelte-ignore unused-export-let
	export let state: any = undefined;

	const getAuditLogSinks = async (configModules: Record<string, CanonicalModule>) => {
		const module = Object.values(configModules).find((m) => m.id === 'auditlogs');
		if (!module) throw new Error('No module found for auditlogs');

		const configOption = module.config_options.find((opt) => opt.id === 'sinks');
		if (!configOption) throw new Error('No config option found for sinks');

		// Find the `sink` column
		let sinkColumn = configOption.columns.find((col) => col.id === 'sink');

		if (!sinkColumn) throw new Error('No `sink` column found');

		// get dispatch type
		let sinkColumnDispatchType = getDispatchType(
			{
				type: 'channel'
			},
			sinkColumn
		);

		return {
			configOption,
			sinkColumn,
			sinkColumnDispatchType
		};
	};

	const createWelcomeMessage = async () => {
		let creds = getAuthCreds();
		if (!creds) throw new Error('No auth credentials found');

		let payload: SettingsExecute = {
			operation: 'Create',
			module: 'auditlogs',
			setting: 'sinks',
			fields: {
				type: 'channel',
				sink: wizard_selectedChannel,
				message: wizard_messageTemplate,
				send_json_context: false, // Not applicable for welcome messages quick action
				broken: false // Not applicable for welcome messages quick action
			}
		};

		const res = await fetchClient(`${get('splashtail')}/guilds/${props.guildId}/settings`, {
			method: 'POST',
			auth: creds.token,
			body: JSON.stringify(payload)
		});

		if (!res.ok) {
			let err = await res.error('Failed to create new setting entry for this module');
			throw new Error(err);
		}
	};

	export let wizard_selectedChannel: string;
	export let wizard_messageTemplate: string;
	export let wizard_saveNoticeProps: NoticeProps;
</script>

<div class="ml-2">
	<h1 class="text-2xl font-semibold">Welcome Messages</h1>
	<p>Welcome your members to your server using AntiRaid (and Audit-Log Sinks).</p>

	{#await getAuditLogSinks(props.clusterModules)}
		<NoticeArea
			props={{
				level: 'loading',
				text: 'Finding config option...'
			}}
		/>
	{:then configOpt}
		<h3 class="text-4xl mb-1">
			<span class="numberCircle font-extrabold">1</span>
			Choose A Channel
		</h3>

		<ChannelInput
			channels={props.guildData.channels}
			channelConstraints={configOpt.sinkColumnDispatchType.channel_constraints || {
				allowed_types: [],
				needed_bot_permissions: '0'
			}}
			style="simplified"
			bind:value={wizard_selectedChannel}
			disabled={false}
		/>

		<h3 class="text-4xl mb-1">
			<span class="numberCircle font-extrabold">2</span> Message please?
		</h3>

		<p>
			Now, now, minister... I've laid out alternative proposals for your bid to reduce the civil
			service
		</p>

		<TemplateBuilder bind:rawTemplateOutput={wizard_messageTemplate} />
		<code class="text-white whitespace-pre-wrap">{wizard_messageTemplate}</code>

		<ButtonReact
			color={Color.Themable}
			icon="ant-design:check-outlined"
			onClick={createWelcomeMessage}
			text="Create Welcome Message"
			states={{
				loading: 'Creating...',
				success: 'Created!',
				error: 'Failed to create'
			}}
			bind:noticeProps={wizard_saveNoticeProps}
		/>

		{#if wizard_saveNoticeProps}
			<NoticeArea props={wizard_saveNoticeProps} />
		{/if}
	{:catch err}
		<NoticeArea
			props={{
				level: 'error',
				text: `Failed to fetch audit log sinks: ${err}`
			}}
		/>
	{/await}

	<style>
		.numberCircle {
			display: inline-block;
			width: fit-content;
			min-width: 1rem;
			padding-top: 1rem;
			padding-right: 0.5rem;
			align-items: center;
			justify-content: center;
			text-align: center; /* center the character*/
			line-height: em(12); /* needs to match the height */
			aspect-ratio: 1 / 1;
		}
	</style>
</div>
