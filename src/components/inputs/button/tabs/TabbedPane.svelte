<script lang="ts">
	import logger from '$lib/ui/logger';
	import TabButton from './TabButton.svelte';

	interface Tab {
		id: string;
		label: string;
		onClick?: () => void;
	}

	export let tabs: Tab[];

	export let visibleTab: string;

	$: {
		if (!visibleTab && tabs) visibleTab = tabs[0].id;
	}
</script>

<center>
	<div class="btn-group variant-filled text-sm rounded-md">
		{#each tabs as tab}
			<TabButton
				visible={tab.id == visibleTab}
				text={tab.label}
				onClick={() => {
					if (tab.onClick) {
						tab.onClick();
						return;
					} else {
						logger.info('TabButton.switch', tab.id);
						visibleTab = tab.id;
					}
				}}
			/>
		{/each}
	</div>
</center>
