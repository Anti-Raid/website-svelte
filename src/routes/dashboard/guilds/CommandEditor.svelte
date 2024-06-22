<script lang="ts">
	import Message from '../../../components/Message.svelte';
	import BoolInput from '../../../components/inputs/BoolInput.svelte';
	import ButtonReact from '../../../components/inputs/button/ButtonReact.svelte';
	import { Color } from '../../../components/inputs/button/colors';
	import { GuildCommandConfiguration } from '$lib/generated/silverpelt';
	import Modal from '../../../components/Modal.svelte';

	export let isOpen: boolean;
	export let commandName: string;
	export let commandConfigs: GuildCommandConfiguration[];
</script>

<Modal bind:showModal={isOpen} title={`Command '${commandName}'`}>
	<h2 class="text-xl font-semibold">Command Configurations</h2>
	<ul>
		{#each commandConfigs as commandConfig}
			<li>
				<details>
					<summary class="text-lg font-semibold hover:cursor-pointer"
						>{commandConfig.command}</summary
					>
					<BoolInput
						id={`cmd-enabled-${commandConfig.command}`}
						label="Command Enabled"
						description="Whether this command is enabled or not"
						disabled={false}
						value={!commandConfig?.disabled}
						onChange={async (v) => {}}
					/>

					<ButtonReact
						color={Color.Themable}
						icon="mdi:edit"
						text="Manage..."
						onClick={async () => {}}
						states={{
							loading: 'Loading...',
							error: 'Failed to load command configurations',
							success: 'Successfully loaded command configurations'
						}}
					/>
				</details>
			</li>
		{/each}
	</ul>
</Modal>
