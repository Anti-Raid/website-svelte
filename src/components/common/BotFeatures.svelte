<script lang="ts">
	import Benefit from '../Benefit.svelte';

	interface BenefitProp {
		Title: string;
		Description: string;
		Icon: string;
	}

	const Benefits: BenefitProp[] = [
		{
			Title: 'Customizable Backups',
			Description: `AntiRaid offers you with customizable <em>and</em> downloadable server backups allowing you to both backup exactly what you need and control your server's data if you want to including local backups and restores!`,
			Icon: 'heroicons:archive-box-arrow-down'
		},
		{
			Title: 'Limits',
			Description: `With AntiRaid, you can easily set up precise rate limits to control exactly what your moderators can do. This ensures your server remains protected and your moderation actions are well-regulated.`,
			Icon: 'heroicons:shield-check'
		},
		{
			Title: 'Raid Prevention',
			Description: `AntiRaid offers advanced raid protection with customizable lockdown settings to secure your server during a raid. Automatically prevent new members from joining, control access to specific channels, and receive instant alerts to stay informed and manage disruptions effectively.`,
			Icon: 'heroicons-outline:globe-alt'
		},
		{
			Title: 'User Friendly',
			Description: `Unlike most other bots, AntiRaid provides an API for extensive control, allowing you to manage backups and settings, and export your data. This ensures flexibility and helps you avoid vendor-locking by easily switching to other solutions if needed.`,
			Icon: 'mdi:user'
		},
		{
			Title: 'Unrivaled Scripting',
			Description: `Our unrivaled scripting, based on Roblox Luau, allows you to customize AntiRaid to the specific needs of your server instead of being yet another Generic Discord Bot`,
			Icon: 'heroicons-outline:bolt'
		},
		{
			Title: 'Audit Logging',
			Description: `AntiRaid enhances server security by sending notifications to a specific channel every time an action occurs. This real-time logging helps you monitor server activity and stay informed about potential threats, allowing for swift responses to protect against attackers.`,
			Icon: 'heroicons-outline:chat-bubble-bottom-center-text'
		}
	];
</script>

{#each Benefits as item}
	<Benefit icon={item.Icon} title={item.Title}>
		<p class="text-xs/4 md:text-sm lg:text-base font-medium font-monster tracking-tight">
			{@html item.Description}
		</p>
	</Benefit>
{/each}
