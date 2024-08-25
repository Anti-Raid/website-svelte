<script lang="ts">
	import Meta from '../../components/Meta.svelte';
	import Divider from '../../components/Divider.svelte';
	import BotFeatures from '../../components/common/BotFeatures.svelte';
	import { makeSharedRequest, opGetApiConfig, opGetGuildStaffTeam } from '$lib/fetch/ext';
	import Message from '../../components/Message.svelte';

	interface TeamMember {
		Name: string;
		Role: string;
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
				Avatar: member?.user?.avatar
			});
		}

		return teamMembers;
	};
</script>

<Meta
	title="About"
	description="This website is extremely experimental, and should not be used by the public at this time."
/>

<section>
	<div class="text-center lg:text-left">
		<h1 class="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
			<span class="block text-white xl:inline">&#128075; About Us</span>
		</h1>

		<p
			class="mt-3 text-base text-white sm:mx-auto sm:mt-5 sm:max-w-xl sm:text-lg md:mt-5 md:text-xl lg:mx-0"
		>
			Learn more about <span class="text-indigo-600 font-bold">AntiRaid</span> and our team!
		</p>
	</div>

	<div class="p-4" />

	<p class="text-xl text-white font-semibold text-center">
		<span class="text-indigo-600">AntiRaid</span> is a
		<span class="font-extrabold">Automatic Moderation Service</span>
		created to protect your
		<a href="/invite" class="text-indigo-600 xl:inline hover:text-red-600">Discord Server</a>
		from threats, unsafe bots and spamming using our advanced technology!
	</p>

	<div class="p-4" />

	<Divider text="Features" margin="6" />

	<div class="p-2" />

	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div id="features-what" class="text-center">
			<h2 class="text-lg font-semibold text-indigo-600">Features</h2>
			<p class="max-w-2xl text-xl text-white lg:mx-auto">What features does AntiRaid offer?</p>
		</div>

		<div class="mt-10">
			<dl class="space-y-10 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10 md:space-y-0">
				<BotFeatures />
			</dl>
		</div>
	</div>

	<div class="p-4" />

	<Divider text="Meet the Team" margin="6" />

	<div class="py-10">
		<div class="mx-auto grid max-w-7xl gap-x-6 gap-y-10 px-6 lg:px-8 xl:grid-cols-3">
			<div class="max-w-2xl">
				<h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">Meet the Team!</h2>
				<p class="mt-3 text-lg leading-8 text-white">
					Interested in joining our team? Join our <a
						href="https://discord.gg/v9qRYthfHf"
						class="block text-indigo-600 font-bold xl:inline hover:text-red-600">Discord Server</a
					>
				</p>
			</div>

			{#await getTeamMembers()}
				<Message type="loading" big={true}>Fetching team members...</Message>
			{:then members}
				<ul class="grid gap-x-8 gap-y-12 sm:grid-cols-2 sm:gap-y-16 xl:col-span-2">
					{#each members as member}
						<li>
							<div class="flex items-center gap-x-6">
								<img
									class="h-16 w-16 rounded-full"
									src={member.Avatar || '/logo.webp'}
									alt={member.Name}
								/>
								<div>
									<h3 class="text-lg font-semibold leading-7 tracking-tight text-white">
										{member.Name}
									</h3>
									<p class="text-md font-semibold leading-6 text-indigo-600">{member.Role}</p>
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
