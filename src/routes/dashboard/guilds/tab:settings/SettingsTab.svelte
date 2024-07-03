<script lang="ts">
	import { CanonicalModule, GuildModuleConfiguration } from '$lib/generated/silverpelt';
	import PermissionChecks from '../../../../components/dashboard/permissions/PermissionChecks.svelte';
	import { PermissionChecks as PCT } from '$lib/generated/silverpelt';
	import BoolInput from '../../../../components/inputs/BoolInput.svelte';
	import ListItem from '../../../../components/ListItem.svelte';
	import UnorderedList from '../../../../components/UnorderedList.svelte';
	import { PartialPatchRecord, createPartialPatch } from '$lib/partialPatch';
	import ButtonReact from '../../../../components/inputs/button/ButtonReact.svelte';
	import { Color } from '../../../../components/inputs/button/colors';
	import { fetchClient } from '$lib/fetch/fetch';
	import { get } from '$lib/configs/functions/services';
	import { getAuthCreds } from '$lib/auth/getAuthCreds';
	import logger from '$lib/ui/logger';
	import { Clearable } from '$lib/generated/types';
	import BoxButton from '../../../../components/inputs/button/BoxButton.svelte';
	import { NoticeProps } from '../../../../components/common/noticearea/noticearea';
	import NoticeArea from '../../../../components/common/noticearea/NoticeArea.svelte';
	import { CommonPermissionContext } from '../../../../components/dashboard/permissions/commonPermissionContext';
	import Label from '../../../../components/inputs/Label.svelte';
	import Setting from './Setting.svelte';

	export let guildId: string;
	export let module: CanonicalModule;
	export let currentModuleConfiguration: GuildModuleConfiguration[];
	export let commonPermissionContext: CommonPermissionContext;

	// Svelte workaround to workaround state
	//
	// If and only if the module id changes do we need to rederive the state
	let moduleId: string;

	$: if (module.id != moduleId) {
		moduleId = module.id;
	}
</script>

{#each module.config_options as configOpt}
	<Setting {module} {configOpt} {guildId} />
{/each}
