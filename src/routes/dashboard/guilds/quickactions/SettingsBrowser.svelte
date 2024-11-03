<script lang="ts">
	import SleekButton from '@components/inputs/button/SleekButton.svelte';
	import { State } from '../core/types';
	import { QuickActionProps } from './actions';

	export let props: QuickActionProps;
	export let state: State;
</script>

<div class="ml-2">
	<h1 class="text-2xl font-semibold">Settings Browser</h1>

	<div class="index-page mb-auto mx-auto">
		{#each Object.values(props.modules).filter((m) => m.config_options.length > 0) as module}
			<section class="mt-4 mb-4">
				<h1 class="text-2xl font-semibold">{module.name}</h1>
				<p>{module.description}</p>
				<div class="col-span-8 grid grid-cols-1 gap-6 lg:grid-cols-2 h-full">
					{#each module.config_options as opt}
						<SleekButton
							onclick={() => {
								props.setState({
									...state,
									openedEntity: {
										module: {
											id: module.id,
											tab: 'settings'
										}
									}
								});

								let count = 0;
								let c = setInterval(() => {
									// Keep trying to scroll down to the setting if its ID has finally been rendered
									let el = document.getElementById(opt.id);

									if (el) {
										el.scrollIntoView({ behavior: 'smooth' });
										clearInterval(c);
									} else if (count > 100) {
										clearInterval(c); // Stop trying after 100 attempts
									}

									count++;
								}, 100);
							}}
							name={opt.name}
							description={opt.description}
						/>
					{/each}
				</div>
			</section>
		{/each}
	</div>
</div>
