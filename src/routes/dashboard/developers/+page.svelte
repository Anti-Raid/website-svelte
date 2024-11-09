<script lang="ts">
	import { getAuthCreds } from '$lib/auth/getAuthCreds';
	import { get } from '$lib/configs/functions/services';
	import { fetchClient } from '$lib/fetch/fetch';
	import {
		CreateUserSession,
		CreateUserSessionResponse,
		UserSession,
		UserSessionList
	} from '$lib/generated/types';
	import Message from '@components/Message.svelte';
	import { DataHandler, Datatable, Th } from '@vincjo/datatables';
	import { Readable } from 'svelte/store';
	import InputText from '@components/inputs/InputText.svelte';
	import Select from '@components/inputs/select/Select.svelte';
	import InputNumber from '@components/inputs/InputNumber.svelte';
	import KittycatPermSelectArray from '@components/dashboard/permissions/KittycatPermSelectArray.svelte';
	import Label from '@components/inputs/Label.svelte';
	import ButtonReact from '@components/inputs/button/ButtonReact.svelte';
	import { Color } from '@components/inputs/button/colors';
	import Pagination from '@components/common/datatable/Pagination.svelte';
	import RowCount from '@components/common/datatable/RowCount.svelte';
	import RowsPerPage from '@components/common/datatable/RowsPerPage.svelte';
	import Search from '@components/common/datatable/Search.svelte';
	import ThFilter from '@components/common/datatable/ThFilter.svelte';
	import ThSort from '@components/common/datatable/ThSort.svelte';
	import { NoticeProps } from '@components/common/noticearea/noticearea';
	import NoticeArea from '@components/common/noticearea/NoticeArea.svelte';
	import { makeSharedRequest, opGetModules } from '$lib/fetch/ext';
	import { CommonPermissionContext } from '@components/dashboard/permissions/commonPermissionContext';
	import {
		extractKnownPermissionsFromModules,
		makeKittycatPermissionMapperFromPermissions
	} from '$lib/ui/permMap';
	import BoolInput from '@components/inputs/BoolInput.svelte';

	let sessionRows: Readable<UserSession[]>;
	let otherSessionRows: Readable<UserSession[]>;

	let currentState = 'Loading developer portal';

	let devMode = false;
	const loadGuildData = async () => {
		let authCreds = getAuthCreds();

		if (!authCreds) throw new Error('No auth credentials found');

		currentState = 'Fetching session data';

		let res = await fetchClient(`${get('splashtail')}/sessions`, {
			auth: authCreds?.token,
			onRatelimit: (n, err) => {
				if (!n) {
					currentState = 'Retrying fetching of session data';
				} else {
					currentState = `${err?.message} [retrying again in ${n / 1000} seconds]`;
				}
			}
		});

		if (!res.ok) {
			let err = await res.error('Session Data', 'markdown');
			throw new Error(err);
		}

		let data: UserSessionList = await res.json();

		const sessionHandler = new DataHandler(
			data.sessions.filter((f) => f?.type == 'login') as UserSession[],
			{ rowsPerPage: 20 }
		);
		const otherSessionHandler = new DataHandler(
			data.sessions.filter((f) => f?.type != 'login') as UserSession[],
			{ rowsPerPage: 20 }
		);

		sessionRows = sessionHandler.getRows();
		otherSessionRows = otherSessionHandler.getRows();

		// Get list of modules
		currentState = 'Fetching all available modules';
		let modules = await makeSharedRequest(opGetModules());

		let commonPermissionContext: CommonPermissionContext = {
			kittycatPermissionMapper: makeKittycatPermissionMapperFromPermissions(
				extractKnownPermissionsFromModules(Object.values(modules))
			)
		};

		devMode = localStorage.getItem('devMode') == 'true';

		return {
			authCreds,
			otherSessionHandler,
			sessionHandler,
			commonPermissionContext
		};
	};

	const revokeSession = async (sessionId: string) => {
		try {
			let authCreds = getAuthCreds();

			if (!authCreds) throw new Error('No auth credentials found');

			let res = await fetchClient(`${get('splashtail')}/sessions/${sessionId}`, {
				method: 'DELETE',
				auth: authCreds?.token
			});

			if (res.ok) {
				sessionTopNoticeArea = {
					level: 'success',
					text: `Successfully revoked session ${sessionId}`
				};
			} else {
				let err = await res.error('Revoke session', 'markdown');
				sessionTopNoticeArea = {
					level: 'error',
					text: err
				};
			}
		} catch (err) {
			sessionTopNoticeArea = {
				level: 'error',
				text: `Failed to revoke session: ${err}`
			};
		}
	};

	let createSession: CreateUserSession = {
		name: '',
		type: 'api',
		expiry: 0,
		perm_limits: []
	};

	let createSessionResp: CreateUserSessionResponse;

	const createSessionFunc = async () => {
		let creds = getAuthCreds();

		if (!creds) throw new Error('No auth credentials found');

		let res = await fetchClient(`${get('splashtail')}/sessions`, {
			method: 'POST',
			auth: creds?.token,
			body: JSON.stringify(createSession)
		});

		if (!res.ok) {
			throw new Error(await res.error('Create session', 'markdown'));
		}

		createSessionResp = await res.json();
	};

	let createSessionNoticeArea: NoticeProps | null = null;
	let sessionTopNoticeArea: NoticeProps | null = null;
</script>

{#await loadGuildData()}
	<Message type="loading">Loading dashboard</Message>
	<small>
		<span class="font-semibold">Current State: </span>
		{currentState}
	</small>
{:then data}
	<h2 class="font-semibold text-2xl">Your Sessions</h2>

	<p>
		<strong>
			Note: Session Tokens (created by logging in) expire every 1 hour and are not suitable for
			developing on the AntiRaid API. Please create an API token instead for that!
		</strong><br /><br />

		Be sure to revoke sessons you don't recognize! The ID of the session you are currently logged
		onto is
		<em class="opacity-70">{data?.authCreds?.session_id}</em>
	</p>

	{#if sessionTopNoticeArea}
		<NoticeArea props={sessionTopNoticeArea} />
	{/if}

	<div class="overflow-x-auto space-y-4">
		<!-- Header -->
		<header class="flex justify-between gap-4">
			<Search handler={data.sessionHandler} />
			<RowsPerPage handler={data.sessionHandler} />
		</header>

		<div class="p-1" />

		<!-- Table -->
		<table class="table table-hover table-compact bg-surface-600 w-full table-auto">
			<thead>
				<tr class="bg-surface-800">
					<ThSort handler={data.sessionHandler} orderBy={'id'}>ID</ThSort>
					<ThSort handler={data.sessionHandler} orderBy={'type'}>Type</ThSort>
					<ThSort handler={data.sessionHandler} orderBy={'expiry'}>Expiry</ThSort>
					<ThSort handler={data.sessionHandler} orderBy={'created_at'}>Created At</ThSort>
					<ThSort handler={data.sessionHandler} orderBy={'id'}>Actions</ThSort>
				</tr>

				<tr class="bg-surface-800">
					<ThFilter handler={data.sessionHandler} filterBy={'id'} />
					<ThFilter handler={data.sessionHandler} filterBy={'type'} />
					<ThFilter handler={data.sessionHandler} filterBy={'expiry'} />
					<ThFilter handler={data.sessionHandler} filterBy={'created_at'} />
					<ThFilter handler={data.sessionHandler} filterBy={'id'} />
				</tr>
			</thead>
			<tbody>
				{#each $sessionRows as session (session.id)}
					<tr>
						<td>
							{session.id}

							{#if session.id == data?.authCreds?.session_id}
								<span class="text-green-500"> (Current Session)</span>
							{/if}
						</td>
						<td>{session.type}</td>
						<td>{session.expiry}</td>
						<td>{session.created_at}</td>
						<td>
							<button
								class="text-red-400 hover:text-red-600"
								on:click={() => revokeSession(session.id)}
							>
								Revoke
							</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>

		<!-- Footer -->
		<footer class="flex justify-between">
			<RowCount handler={data.sessionHandler} />
			<Pagination handler={data.sessionHandler} />
		</footer>
	</div>

	<h1 class="font-semibold text-2xl">API Tokens</h1>

	<div class="overflow-x-auto space-y-4">
		<!-- Header -->
		<header class="flex justify-between gap-4">
			<Search handler={data.otherSessionHandler} />
			<RowsPerPage handler={data.otherSessionHandler} />
		</header>

		<div class="p-1" />

		<!-- Table -->
		<table class="table table-hover table-compact bg-surface-600 w-full table-auto">
			<thead>
				<tr class="bg-surface-800">
					<ThSort handler={data.otherSessionHandler} orderBy={'id'}>ID</ThSort>
					<ThSort handler={data.otherSessionHandler} orderBy={'name'}>Name</ThSort>
					<ThSort handler={data.otherSessionHandler} orderBy={'type'}>Type</ThSort>
					<ThSort handler={data.otherSessionHandler} orderBy={'expiry'}>Expiry</ThSort>
					<ThSort handler={data.otherSessionHandler} orderBy={'created_at'}>Created At</ThSort>
					<ThSort handler={data.otherSessionHandler} orderBy={'id'}>Actions</ThSort>
				</tr>

				<tr class="bg-surface-800">
					<ThFilter handler={data.otherSessionHandler} filterBy={'id'} />
					<ThFilter handler={data.otherSessionHandler} filterBy={'name'} />
					<ThFilter handler={data.otherSessionHandler} filterBy={'type'} />
					<ThFilter handler={data.otherSessionHandler} filterBy={'expiry'} />
					<ThFilter handler={data.otherSessionHandler} filterBy={'created_at'} />
					<ThFilter handler={data.otherSessionHandler} filterBy={'id'} />
				</tr>
			</thead>
			<tbody>
				{#each $otherSessionRows as session (session.id)}
					<tr>
						<td>{session.id}</td>
						<td>{session.name || 'Unnamed API Token'}</td>
						<td>{session.type}</td>
						<td>{session.expiry}</td>
						<td>{session.created_at}</td>
						<td>
							<button
								class="text-red-400 hover:text-red-600"
								on:click={() => revokeSession(session.id)}
							>
								Revoke
							</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>

		<!-- Footer -->
		<footer class="flex justify-between">
			<RowCount handler={data.otherSessionHandler} />
			<Pagination handler={data.otherSessionHandler} />
		</footer>
	</div>

	<h1 class="font-semibold text-2xl">Create Session</h1>

	<p>
		A session is a structure that represents a view into the AntiRaid API. Sessions provide a
		session token that can then be used to authorize reqiests to the API. Temporary sessions of type
		"login" are automatically created when logging in via Discord Oauth2 however these expire 1 hour
		after creation and may not support upcoming functionality such as naming sessions and
		restricting the permissions of sessions
	</p>

	<InputText
		id="session-name"
		label="Session Name"
		placeholder="Tycoon AntiRaid Manager etc."
		minlength={1}
		showErrors={false}
		bind:value={createSession.name}
	/>

	<Select
		id="session-type"
		label="Session Type"
		choices={[{ value: 'api', label: 'API Token', id: 'api' }]}
		bind:value={createSession.type}
	/>

	<InputNumber
		id="session-expiry"
		label="Session Expiry"
		placeholder="Must be greater than 0. Expiry is *in seconds*."
		minlength={1}
		showErrors={false}
		bind:value={createSession.expiry}
	/>

	<Label id="session-perms" label="Permission Limits" />
	<div class="mb-3" />
	<KittycatPermSelectArray
		id="session-perms"
		bind:perms={createSession.perm_limits}
		ctx={data.commonPermissionContext}
	/>

	<ButtonReact
		icon="mdi:plus"
		text="Create Session"
		states={{
			loading: 'Creating Session',
			success: 'Session Created',
			error: 'Failed to create session'
		}}
		onClick={createSessionFunc}
		bind:noticeProps={createSessionNoticeArea}
	/>

	{#if createSessionNoticeArea}
		<NoticeArea props={createSessionNoticeArea} />
	{/if}

	{#if createSessionResp}
		<h2 class="font-semibold text-2xl">Session Created</h2>
		<p class="text-red-500 font-semibold text-lg">
			Please save these credentials somewhere safe. You will need to REMOVE and RECREATE the session
			in order to regenerate a new token!
		</p>
		<p class="break-all">
			<strong>Session ID:</strong>
			{createSessionResp.session_id}<br />
			<strong>Session Token:</strong>
			{createSessionResp.token}
		</p>
	{/if}

	<h2 class="font-semibold text-2xl">Advanced</h2>

	<BoolInput
		id="dev-mode"
		label="Developer Mode"
		description="Enable developer mode to see more advanced/WIP features"
		bind:value={devMode}
		onChange={(v) => localStorage.setItem('devMode', v.toString())}
		disabled={false}
	/>
{:catch err}
	<Message type="error">{@html err}</Message>
{/await}
