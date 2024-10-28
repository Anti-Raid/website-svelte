<script lang="ts">
	import { getVersion } from '$lib/configs/functions/versioner';

	const categories: {
		name: string;
		items: {
			name: string;
			href: string;
		}[];
	}[] = [
		{
			name: 'About',
			items: [
				{
					name: 'Docs',
					href: '/docs'
				},
				{
					name: 'About Us',
					href: '/about#staff'
				}
			]
		},
		{
			name: 'Developers',
			items: [
				{
					name: 'API Docs',
					href: 'https://splashtail-staging.antiraid.xyz'
				},
				{
					name: 'Developer Portal',
					href: 'https://antiraid.xyz/dashboard/developers'
				}
			]
		},
		{
			name: 'Community',
			items: [
				{
					name: 'Discord Server',
					href: '/discord'
				},
				{
					name: 'Forums',
					href: '/forums'
				}
			]
		},
		{
			name: 'Legal',
			items: [
				{
					name: 'Terms of Service',
					href: '/legal/terms'
				},
				{
					name: 'Privacy Policy',
					href: '/legal/privacy'
				}
			]
		}
	];

	const socials: {
		name: string;
		icon: string;
		href: string;
	}[] = [
		{
			name: 'Github',
			icon: 'fa-brands fa-github fa-lg',
			href: 'https://github.com/Anti-Raid'
		}
	];
</script>

<footer class="bg-surface-800 text-black">
	<div class="mx-auto w-full max-w-screen-xl p-4 py-6 lg:py-8">
		<div class="md:flex md:justify-between">
			<div class="mb-6 md:mb-0">
				<a href="https://antiraid.xyz/" class="flex items-center">
					<img src="/logo.webp" class="h-8 me-3" alt="AntiRaid Logo" />
					<span class="self-center text-2xl font-semibold whitespace-nowrap dark:text-white"
						>AntiRaid</span
					>
				</a>
			</div>

			<div class="grid grid-cols-2 gap-8 sm:gap-6 sm:grid-cols-3 md:ml-6 lg:ml-6">
				{#each categories as category}
					<div>
						<h2 class="mb-6 text-sm font-semibold text-white uppercase">
							{category.name}
						</h2>

						<ul class="text-white/75 font-medium">
							{#each category.items as item}
								<li class="mb-4">
									<a href={item.href} class="hover:underline">{item.name}</a>
								</li>
							{/each}
						</ul>
					</div>
				{/each}
			</div>

			<hr class="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />

			<div class="end">
				<p class="text-white font-monster text-md">&copy; 2024 Purrquinox. All Rights Reserved.</p>
				<small class="text-white font-monster text-sm">
					{getVersion()}
				</small>

				<div class="flex mt-4 justify-start sm:mt-0 md:mt-2 lg:mt-2">
					{#each socials as social}
						<a href={social.href} class="text-white hover:text-white/75">
							<i class={social.icon} />
							<span class="sr-only">{social.name}</span>
						</a>
					{/each}
				</div>
			</div>
		</div>
	</div>
</footer>
