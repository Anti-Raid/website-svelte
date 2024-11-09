export const load = async ({ fetch }: any) => {
	interface StatisticsData {
		resp: {
			uptime: number;
			managers: {
				display_name: string;
				shard_groups: {
					shards: Array<[number, number, number, number, number, number]>;
				}[];
			}[];
		};
		shard_conns: {
			[key: number]: {
				status: 'MarkedForClosure' | 'Active';
				real_latency: number;
				guilds: number;
				uptime: number;
				total_uptime: number;
			};
		};
		total_guilds: number;
	}

	const statsApi: string = 'https://splashtail-staging.antiraid.xyz/bot-stats';
	let stats: StatisticsData | null = null;

	stats = await fetch(statsApi).then(async (res: Response) => {
		const status = res.status;

		if (status === 200) {
			const data: StatisticsData = await res.json();

			if (data) return data;
			else return null;
		} else return null;
	});

	return {
		stats: stats
	};
};
