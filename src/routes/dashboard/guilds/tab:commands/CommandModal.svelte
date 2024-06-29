<script lang="ts">
	import { CanonicalModule, GuildCommandConfiguration } from '$lib/generated/silverpelt';
	import Modal from '../../../../components/Modal.svelte';
	import { ParsedCanonicalCommandData } from '$lib/ui/commands';
	import CommandEditor from './CommandEditor.svelte';
	import { CommonPermissionContext } from '../../../../components/dashboard/permissions/commonPermissionContext';

	export let guildId: string;
	export let moduleId: string;
	export let clusterModules: Record<string, CanonicalModule>;
	export let commonPermissionContext: CommonPermissionContext;
	export let commands: ParsedCanonicalCommandData[];

	export let currentOpenCommand: ParsedCanonicalCommandData;
	export let allCurrentCommandConfigurations: GuildCommandConfiguration[];
	export let configsBeingEditted: GuildCommandConfiguration[];
	export let isOpen: boolean;
</script>

<Modal
	bind:showModal={isOpen}
	title={`Command '${currentOpenCommand.full_name}'`}
	logo="/logo.webp"
>
	<h2 class="text-xl font-semibold">Command Configurations</h2>
	<ul>
		{#each configsBeingEditted as commandConfig}
			<li>
				<details>
					<summary class="text-lg font-semibold hover:cursor-pointer"
						>{commandConfig.command}</summary
					>
					<CommandEditor
						{guildId}
						module={clusterModules[moduleId]}
						{allCurrentCommandConfigurations}
						{commonPermissionContext}
						currentCommandConfiguration={{
							...commandConfig,
							perms: commandConfig.perms
								? commandConfig.perms
								: {
										checks: [],
										checks_needed: 1
								  }
						}}
						{commands}
					/>
				</details>
			</li>
		{/each}
	</ul>
</Modal>
