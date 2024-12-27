import { getAuthCreds } from '$lib/auth/getAuthCreds';
import { get } from '$lib/configs/functions/services';
import { fetchClient } from '$lib/fetch/fetch';
import { ApiConfig, BotState, GuildStaffTeam } from '$lib/generated/types';
import logger from '$lib/ui/logger';

let cachedData: Map<string, any> = new Map();
let currentlyRunning = new Set<string>();

interface SharedRequester<T> {
	name: string;
	requestFunc: () => Promise<T>;
	shouldCache: boolean;
}

interface SharedRequestOpts {
	forceRefresh?: boolean;
}

// Make a shared request also checking cache as well
export async function makeSharedRequest<T>(
	requester: SharedRequester<T>,
	opts?: SharedRequestOpts
): Promise<T> {
	if (requester.shouldCache && currentlyRunning.has(requester.name)) {
		return await new Promise((resolve) => {
			let interval = setInterval(() => {
				if (!currentlyRunning.has(requester.name)) {
					clearInterval(interval);
					resolve(cachedData.get(requester.name));
				}
			}, 100);
		});
	}

	currentlyRunning.add(requester.name);

	if (cachedData.has(requester.name) && !opts?.forceRefresh) {
		currentlyRunning.delete(requester.name);
		return cachedData.get(requester.name);
	}

	try {
		const data = await requester.requestFunc();

		logger.info('makeSharedRequest', `Fetched ${requester.name} from server`, data);

		if (requester.shouldCache) {
			cachedData.set(requester.name, data);
		}

		currentlyRunning.delete(requester.name);
		return data;
	} catch (err) {
		currentlyRunning.delete(requester.name);
		throw err;
	}
}

// Returns the API config
export const opGetApiConfig: SharedRequester<ApiConfig> = {
	name: 'apiConfig',
	requestFunc: async (): Promise<ApiConfig> => {
		const res = await fetchClient(`${get('splashtail')}/config`);
		if (!res.ok) {
			let err = await res.error('Api Config');
			throw new Error(err);
		}

		const data: ApiConfig = await res.json();

		return data;
	},
	shouldCache: true
};

// Fetches the staff team of a server
export const opGetGuildStaffTeam = (guildId: string): SharedRequester<GuildStaffTeam> => {
	return {
		name: `guildStaffTeam:${guildId}`,
		requestFunc: async (): Promise<GuildStaffTeam> => {
			const res = await fetchClient(`${get('splashtail')}/guilds/${guildId}/staff-team`);
			if (!res.ok) {
				let err = await res.error('Guild Staff Team');
				throw new Error(err);
			}

			let data: GuildStaffTeam = await res.json();
			return data;
		},
		shouldCache: true
	};
};

// Fetches the modules of the bot
export const opGetBotState = (): SharedRequester<BotState> => {
	return {
		name: `getBotState`,
		requestFunc: async (): Promise<BotState> => {
			const res = await fetchClient(`${get('splashtail')}/bot-state`);
			if (!res.ok) {
				let err = await res.error('Get Bot State');
				throw new Error(err);
			}

			const data: BotState = await res.json();

			return data;
		},
		shouldCache: true
	};
};
