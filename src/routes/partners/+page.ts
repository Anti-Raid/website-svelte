interface PartnerLink {
	name: string;
	emoji: string;
	link: string;
}

interface Partner {
	name: string;
	description: string;
	logo: string;
	url: string;

	owner: string;
	owner_image: string;
	owner_website: string;

	links: PartnerLink[];
} // cum

const partners: Partner[] = [
	{
		name: 'NetSocial',
		description:
			'Connect, Share, Grow. NetSocial empowers communities to be who they want to be, no more bots, paywalls and obscene content!',
		logo: 'https://cdn.netsocial.app/logos/netsocial.png',
		url: 'https://netsocial.app/',
		owner: 'Ranveer Soni',
		owner_image: 'https://avatars.githubusercontent.com/u/87431619?v=4',
		owner_website: 'https://maya25-me.vercel.app/',
		links: [
			{
				name: 'Website',
				emoji: '👀',
				link: 'https://netsocial.app/'
			},
			{
				name: 'Discord',
				emoji: 'fa-brands fa-discord',
				link: 'https://discord.gg/Tf6PCgDwa5'
			}
		]
	},
	{
		name: 'Infinity Bots',
		description: 'Search our vast list of bots for an exciting start to your server.',
		logo: 'https://cdn.infinitybots.gg/core/full_logo.webp',
		url: 'https://infinitybots.gg/',
		owner: 'Toxic Dev',
		owner_image:
			'https://res.cloudinary.com/dh30c3f52/image/upload/v1707465896/immhuag1zamm3juw2mn8.jpg',
		owner_website: 'https://toxicdev.me/',
		links: [
			{
				name: 'Website',
				emoji: '👀',
				link: 'https://infinitybots.gg/'
			},
			{
				name: 'Discord',
				emoji: 'fa-brands fa-discord',
				link: 'https://discord.com/invite/KBCRuBKrHe'
			}
		]
	}
];

export const load = async () => {
	return {
		partners
	};
};
