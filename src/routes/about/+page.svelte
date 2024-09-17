<script lang="ts">
	import Meta from '../../components/Meta.svelte';
	import BotFeatures from '../../components/common/BotFeatures.svelte';
	import { makeSharedRequest, opGetApiConfig, opGetGuildStaffTeam } from '$lib/fetch/ext';
	import Message from '../../components/Message.svelte';

	interface TeamMember {
		DisplayName: string | undefined;
		Username: string | undefined;
		Role: string;
		DisplayRoles: [string, number][];
		Avatar: string | undefined;
	}

	const getTeamMembers = async () => {
		let config = await makeSharedRequest(opGetApiConfig);
		let mainServerStaff = await makeSharedRequest(opGetGuildStaffTeam(config.main_server));

		let teamMembers: TeamMember[] = [];

		for (let member of mainServerStaff.members) {
			let display_roles: [string, number][] = [];

			for (let role of member.role) {
				let roleData = mainServerStaff.roles.find((r) => r.role_id === role);
				if (roleData) display_roles.push([roleData.display_name?.toString() || '', roleData.index]);
			}

			display_roles.sort((a, b) => a[1] - b[1]);

			teamMembers.push({
				DisplayName: member.user?.display_name,
				Username: member.user?.username,
				Role: display_roles.map((x) => x[0]).join(', '),
				DisplayRoles: display_roles,
				Avatar: member?.user?.avatar
			});
		}

		teamMembers.sort((a, b) => {
			let highestIndexA = a.DisplayRoles[0][1];
			let highestIndexB = b.DisplayRoles[0][1];

			for (let i = 1; i < a.DisplayRoles.length; i++) {
				if (a.DisplayRoles[i][1] < highestIndexA) highestIndexA = a.DisplayRoles[i][1];
			}
			for (let i = 1; i < b.DisplayRoles.length; i++) {
				if (b.DisplayRoles[i][1] < highestIndexB) highestIndexB = b.DisplayRoles[i][1];
			}

			return 10 * (highestIndexA - highestIndexB) - (a.DisplayRoles.length - b.DisplayRoles.length);
		});

		return teamMembers;
	};
</script>

<Meta
	title="About"
	description="This website is extremely experimental, and should not be used by the public at this time."
/>

<section>
	<div class="text-center md:text-left">
		<h1
			class="text-4xl font-monster font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl"
		>
			<span class="block text-white xl:inline">&#128075; About Us</span>
		</h1>

		<p
			class="mt-3 text-base text-center md:text-left text-white font-semibold font-cabin ml-3 sm:mt-5 sm:text-lg md:ml-0 md:mt-5 md:text-xl lg:ml-0 lg:mx-0"
		>
			Learn more about <span class="text-indigo-600 font-bold">AntiRaid</span> and our team!
		</p>
	</div>

	<div class="p-4" />

	<p class="text-md md:text-xl text-white font-cabin font-semibold text-center md:text-left">
		AntiRaid offers powerful, automated protection for your Discord server. Designed to combat spam,
		harmful bots, and disruptive behavior, our advanced moderation technology ensures a safe and
		welcoming environment. With AntiRaid, you can focus on engaging with your community while we
		handle the security, providing real-time defense against potential threats. Invite AntiRaid
		today for reliable and effortless server protection.
	</p>

	<div class="p-4" />

	<section id="features">
		<div id="features-what" class="text-center">
			<h2 class="text-4xl font-cabin font-extrabold text-center md:text-left text-indigo-600">
				Features
			</h2>
			<p class="font-monster text-xl text-white text-center md:text-left lg:mx-auto">
				What do we have to offer?
			</p>
		</div>
		<div class="mt-5" />

		<center>
			<dl class="mx-2.5 space-y-4 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10 md:space-y-0">
				<BotFeatures />
			</dl>
		</center>
	</section>

	<div class="py-10">
		<section id="staff">
			<div class="text-center">
				<h2 class="text-4xl font-cabin font-extrabold text-center md:text-left text-indigo-600">
					Meet the Team!
				</h2>
				<p class="font-monster text-xl text-white text-center md:text-left lg:mx-auto">
					Interested in joining our team? Join our <a
						href="/discord"
						class="text-indigo-600 font-bold xl:inline hover:text-red-600">Discord Server</a
					>
				</p>
			</div>

			{#await getTeamMembers()}
				<Message type="loading" big={true}>Fetching team members...</Message>
			{:then members}
				<ul class="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{#each members as member}
						<li
							class="inline-block p-2 max-w-sm mx-5 bg-surface-800/90 hover:bg-surface-800/50 overflow-hidden rounded-l-full rounded-r-md"
						>
							<div class="flex items-center">
								<img
									class="h-16 w-16 rounded-full"
									src={member.Avatar || '/logo.webp'}
									alt="{member.DisplayName}'s Avatar"
								/>

								<div class="inline-block ml-3">
									<h3
										class="text-lg font-monster font-semibold leading-7 overflow-clip tracking-tight text-white"
									>
										{member.DisplayName}
									</h3>
									<p class="text-sm font-monster font-semibold text-white">@{member.Username}</p>
									<p class="text-md font-cabin font-semibold leading-6 text-indigo-600">
										{member.Role}
									</p>
								</div>
							</div>
						</li>
					{/each}
				</ul>
			{:catch error}
				<Message type="error" big={true}>
					{@html error}
				</Message>
			{/await}
		</section>
	</div>
</section>
