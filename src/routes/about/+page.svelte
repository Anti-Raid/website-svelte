<script lang="ts">
	import Meta from '../../components/Meta.svelte';
	import Divider from '../../components/Divider.svelte';
	import BotFeatures from '../../components/common/BotFeatures.svelte';
	import { makeSharedRequest, opGetApiConfig, opGetGuildStaffTeam } from '$lib/fetch/ext';
	import Message from '../../components/Message.svelte';
	import { GuildStaffRoles } from '$lib/generated/types';

	interface TeamMember {
		Name: string;
		Role: string;
		DisplayRoles: [string, number][];
		Avatar: string | undefined;
	}

	const getTeamMembers = async () => {
		let config = await makeSharedRequest(opGetApiConfig);
		let mainServerStaff = await makeSharedRequest(opGetGuildStaffTeam(config.main_server));

		let teamMembers: TeamMember[] = [];

		for (let member of mainServerStaff.members) {
			// Find highest role
			let display_roles: [string, number][] = [];

			for (let role of member.role) {
				let roleData = mainServerStaff.roles.find((r) => r.role_id === role);
				if (roleData) {
					display_roles.push([roleData.display_name?.toString() || '', roleData.index]);
				}
			}

			// Sort with lowest index first
			display_roles.sort((a, b) => a[1] - b[1]);

			teamMembers.push({
				Name: `${member.user?.display_name} (${member.user?.username})`,
				Role: display_roles.map((x) => x[0]).join(', '),
				DisplayRoles: display_roles,
				Avatar: member?.user?.avatar
			});
		}

		// Sort team members on two criteria:
		// 1. Lowest role index
		// 2. Number of display roles
		teamMembers.sort((a, b) => {
			// Get lowest role index of a
			let highestIndexA = a.DisplayRoles[0][1];
			let highestIndexB = b.DisplayRoles[0][1];

			for (let i = 1; i < a.DisplayRoles.length; i++) {
				if (a.DisplayRoles[i][1] < highestIndexA) {
					highestIndexA = a.DisplayRoles[i][1];
				}
			}

			for (let i = 1; i < b.DisplayRoles.length; i++) {
				if (b.DisplayRoles[i][1] < highestIndexB) {
					highestIndexB = b.DisplayRoles[i][1];
				}
			}

			// It is expected to return a negative value if the first argument is less than the second argument, zero if they're equal, and a positive value otherwise

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
	<div class="text-center lg:text-left">
		<h1 class="text-4xl font-monster font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
			<span class="block text-white xl:inline">&#128075; About Us</span>
		</h1>

		<p
			class="mt-3 text-base text-white font-semibold font-cabin ml-3 sm:mt-5 sm:text-lg md:ml-0 md:mt-5 md:text-xl lg:ml-0 lg:mx-0"
		>
			Learn more about <span class="text-indigo-600 font-bold">AntiRaid</span> and our team!
		</p>
	</div>

	<div class="p-4" />

	<p class="text-lg/6 text-white font-cabin font-semibold text-center">
		AntiRaid is your ultimate solution for automated server protection on Discord. Our state-of-the-art service is engineered to shield your community from a myriad of threats, including intrusive bots, spam, and malicious activity. With AntiRaid’s cutting-edge technology, you can ensure that your server remains secure and welcoming, allowing you to focus on what matters most—engaging with your community. Our advanced moderation system works tirelessly to detect and neutralize potential dangers in real-time, providing a seamless and robust defense for your Discord environment. Invite AntiRaid today and experience unparalleled peace of mind for your server's safety and integrity.
	</p>

	<div class="p-4" />

	<section id="features">
        <div id="features-what" class="text-center">
            <h2 class="text-4xl font-cabin font-extrabold text-indigo-600">Features</h2>
            <p class="font-monster text-xl text-white lg:mx-auto">What do we have to offer?</p>
        </div>
        <div class="mt-5" />
    
        <center>
            <dl class="mx-2.5 space-y-4 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10 md:space-y-0">
                <BotFeatures />
            </dl>
        </center>
    </section>

	<div class="py-10">
		<div class="mx-auto grid max-w-7xl gap-x-6 gap-y-10 px-6 lg:px-8 xl:grid-cols-3">
			<div class="max-w-2xl">
				<h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">Meet the Team!</h2>
				<p class="mt-3 text-lg leading-8 text-white">
					Interested in joining our team? Join our <a
						href="/discord"
						class="block text-indigo-600 font-bold xl:inline hover:text-red-600">Discord Server</a
					>
				</p>
			</div>

			{#await getTeamMembers()}
				<Message type="loading" big={true}>Fetching team members...</Message>
			{:then members}
                <ul class="grid gap-y-2 sm:grid-cols-2 sm:gap-y-16 xl:col-span-2 overflow-hidden">
					{#each members as member}
                        <li class="inline-block p-2 max-w-sm bg-surface-800/90 overflow-hidden rounded-md">
							<div class="flex items-center">
								<img
									class="h-16 w-16 rounded-full"
									src={member.Avatar || '/logo.webp'}
									alt="{member.Name}'s Avatar"
								/>
                                
								<div class="inline-block ml-3">
									<h3 class="text-lg font-monster font-semibold leading-7 tracking-tight text-white">
										{member.Name.replace("(", "(@")}
									</h3>
									<p class="text-md font-cabin font-semibold leading-6 text-indigo-600">{member.Role}</p>
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
		</div>
	</div>
</section>
