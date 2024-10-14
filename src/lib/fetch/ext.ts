import { getAuthCreds } from '$lib/auth/getAuthCreds';
import { get } from '$lib/configs/functions/services';
import { fetchClient } from '$lib/fetch/fetch';
import {
	CanonicalModule,
	FullGuildCommandConfiguration,
	GuildModuleConfiguration
} from '$lib/generated/silverpelt';
import { ApiConfig, GuildStaffTeam } from '$lib/generated/types';
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
export const opGetModules = (
): SharedRequester<Record<string, CanonicalModule>> => {
	return {
		name: `modules`,
		requestFunc: async (): Promise<Record<string, CanonicalModule>> => {
			const res = await fetchClient(`${get('splashtail')}/modules`);
			if (!res.ok) {
				let err = await res.error('Modules');
				throw new Error(err);
			}

			const data: CanonicalModule[] = await res.json();

			data.sort((a, b) => a.name.localeCompare(b.name)); // Sort by module name in ascending order

			// A CanonicalModule[] is hard to work with, so we'll convert it to a map
			let parsedMap: Record<string, CanonicalModule> = {};

			for (let module of data) {
				if (module.web_hidden) {
					continue; // Skip hidden modules
				}

				// Get rid of web_hidden commands as well
				module.commands = module.commands.filter((cmd) => !cmd.extended_data.web_hidden);

				parsedMap[module.id] = module;
			}

			return parsedMap;
		},
		shouldCache: true
	};
};

export const opGetModuleConfiguration = (
	guildId: string
): SharedRequester<GuildModuleConfiguration[]> => {
	let authData = getAuthCreds();

	return {
		name: `guildModuleConfiguration:${guildId}`,
		requestFunc: async (): Promise<GuildModuleConfiguration[]> => {
			const res = await fetchClient(
				`${get('splashtail')}/guilds/${guildId}/module-configurations`,
				{
					auth: authData?.token
				}
			);
			if (!res.ok) {
				let err = await res.error('Guild Module Configuration');
				throw new Error(err);
			}

			const data: GuildModuleConfiguration[] = await res.json();

			return data;
		},
		shouldCache: false
	};
};

export const opGetAllCommandConfigurations = (
	guildId: string
): SharedRequester<FullGuildCommandConfiguration[]> => {
	let authData = getAuthCreds();

	return {
		name: `guildCommandConfigurations:${guildId}`,
		requestFunc: async (): Promise<FullGuildCommandConfiguration[]> => {
			const res = await fetchClient(
				`${get('splashtail')}/guilds/${guildId}/command-configurations`,
				{
					auth: authData?.token
				}
			);
			if (!res.ok) {
				let err = await res.error('Guild Command Configurations');
				throw new Error(err);
			}

			const data: FullGuildCommandConfiguration[] = await res.json();

			return data;
		},
		shouldCache: false
	};
};
