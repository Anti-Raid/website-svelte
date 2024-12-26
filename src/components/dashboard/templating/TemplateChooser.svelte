<script lang="ts">
	import { SettingsExecute, SettingsExecuteResponse } from '$lib/generated/types';
	import { settingsFetchQueue } from '$lib/ui/settings';
	import Icon from '@iconify/svelte';
	import BoxButton from '../../inputs/button/BoxButton.svelte';
	import Message from '../../Message.svelte';
	import InputText from '../../inputs/InputText.svelte';
	import ButtonReact from '../../inputs/button/ButtonReact.svelte';
	import { fetchClient } from '$lib/fetch/fetch';
	import { get } from '$lib/configs/functions/services';
	import { getAuthCreds } from '$lib/auth/getAuthCreds';
	import { NoticeProps } from '../../common/noticearea/noticearea';
	import NoticeArea from '../../common/noticearea/NoticeArea.svelte';
	import TemplateBuilder from './TemplateBuilder.svelte';

	export let guildId: string;
	export let value: string;

	let offset: number = 0;

	let templateListRef: SettingsExecuteResponse;

	const templateList = async (limit: number, offset: number) => {
		let payload: SettingsExecute = {
			operation: 'View',
			setting: 'guild_templates',
			fields: {
				__limit: limit,
				__offset: offset
			}
		};

		templateListRef = await settingsFetchQueue.addToQueue(guildId, payload);

		return;
	};

	let newTemplateName: string;
	let newTemplateValue: string;

	const createTemplateAndChooseTemplate = async () => {
		let payload: SettingsExecute = {
			operation: 'Create',
			setting: 'guild_templates',
			fields: {
				name: newTemplateName,
				content: newTemplateValue
			}
		};

		let creds = getAuthCreds();

		if (!creds) {
			throw new Error('No auth credentials found');
		}

		let res = await fetchClient(`${get('splashtail')}/guilds/${guildId}/settings`, {
			method: 'POST',
			auth: creds.token,
			body: JSON.stringify(payload)
		});

		if (!res.ok) {
			let err = await res.error('Failed to create new setting entry for this module');
			throw new Error(err);
		}

		let resp: SettingsExecuteResponse = await res.json();

		// Choose the newly created template
		value = newTemplateName;

		// Reset the input fields
		newTemplateName = '';
		newTemplateValue = '';

		// Add to the template list
		templateListRef.fields.push(resp.fields[0]);

		let c = setInterval(() => {
			let el = document.querySelector(`#setting-schema-details-${value}`);
			if (el) {
				clearInterval(c);
				el.setAttribute('open', 'true');
			}
		}, 100);

		return;
	};

	let noticeProps: NoticeProps;
</script>

{#await templateList(10, offset)}
	<p>Loading...</p>
{:then}
	{#each templateListRef.fields as fields}
		<details
			id={`setting-schema-details-${fields['name']}`}
			class="setting-schema__details border p-2 bg-black hover:bg-slate-900"
		>
			<summary class="setting-schema__summary hover:cursor-pointer break-words"
				>{fields['name']}</summary
			>

			{#if value != fields['name']}
				<BoxButton
					onClick={() => {
						value = fields['name'];
					}}>Select</BoxButton
				>
			{:else}
				<p>
					<Icon icon="mdi:check" />
					Selected
				</p>
				<BoxButton
					onClick={() => {
						value = '';
					}}>Deselect</BoxButton
				>
			{/if}
		</details>
	{/each}

	<!--Create a template directly-->
	<details
		id="setting-schema-createrowelement"
		class="setting-schema-create__details border p-2 bg-black hover:bg-slate-900"
	>
		<summary
			class="setting-schema-create__summary hover:cursor-pointer font-semibold text-xl items-center align-middle justify-center break-words"
		>
			<Icon
				icon="fa6-solid:plus"
				class="inline-block m-0 p-0 font-semibold mr-1 align-middle"
			/>Create New Template
		</summary>
		<InputText
			bind:value={newTemplateName}
			placeholder="Template Name"
			id="name"
			label="Template Name"
			minlength={0}
		/>
		<TemplateBuilder bind:output={newTemplateValue} id="value" label="Template Value" />
		<ButtonReact
			icon="fa6-solid:plus"
			text="Create Template And Select"
			onClick={createTemplateAndChooseTemplate}
			states={{
				loading: 'Creating...',
				success: 'Created!',
				error: 'Failed to create!'
			}}
			{noticeProps}
		/>

		{#if noticeProps}
			<NoticeArea props={noticeProps} />
		{/if}
	</details>
{:catch err}
	<Message type="error"><strong>Error</strong>{@html err?.message || err}</Message>
{/await}
