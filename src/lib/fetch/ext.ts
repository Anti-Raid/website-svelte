import { getAuthCreds } from '$lib/auth/getAuthCreds';
import { get } from '$lib/configs/functions/services';
import { fetchClient } from '$lib/fetch/fetch';
import { InstanceList } from '$lib/generated/mewld/proc';
import { CanonicalModule, GuildCommandConfiguration, GuildModuleConfiguration } from '$lib/generated/silverpelt';
import { ApiError } from '$lib/generated/types';
import { formatApiError } from '$lib/ui/error';
import logger from '$lib/ui/logger';

let cachedData: Map<string, any> = new Map();

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
	if (cachedData.has(requester.name) && !opts?.forceRefresh) {
		return cachedData.get(requester.name);
	}

	const data = await requester.requestFunc();

	logger.info('makeSharedRequest', `Fetched ${requester.name} from server`, data);

	if (requester.shouldCache) {
		cachedData.set(requester.name, data);
	}

	return data;
}

// Fetches the health of all clusters
export const opGetClusterHealth: SharedRequester<InstanceList> = {
	name: 'clusterHealth',
	requestFunc: async (): Promise<InstanceList> => {
		const res = await fetchClient(`${get('splashtail')}/clusters/health`);
		if (!res.ok) {
			let resp: ApiError = await res.json();
			throw new Error(`Failed to fetch clusters health: ${res.status}: ${resp?.message}`);
		}

		const data: InstanceList = await res.json();

		return data;
	},
	shouldCache: true
};

// Fetches the modules of a cluster
export const opGetClusterModules = (
	clusterId: number
): SharedRequester<Record<string, CanonicalModule>> => {
	return {
		name: `clusterModules:${clusterId}`,
		requestFunc: async (): Promise<Record<string, CanonicalModule>> => {
			const res = await fetchClient(`${get('splashtail')}/clusters/${clusterId}/modules`);
			if (!res.ok) {
				let resp: ApiError = await res.json();
				throw new Error(`Failed to fetch clusters modules: ${res.status}: ${resp?.message}`);
			}

			const data: CanonicalModule[] = await res.json();

			// A CanonicalModule[] is hard to work with, so we'll convert it to a map
			let parsedMap: Record<string, CanonicalModule> = {};

			for (let module of data) {
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
				`${get('splashtail')}/users/${authData?.user_id}/guilds/${guildId}/module-configurations`,
				{
					headers: {
						Authorization: `User ${authData?.token}`
					}
				}
			);
			if (!res.ok) {
				let resp: ApiError = await res.json();
				throw new Error(
					`Failed to fetch guild module configuration: ${res.status}: ${resp?.message}`
				);
			}

			const data: GuildModuleConfiguration[] = await res.json();

			return data;
		},
		shouldCache: false
	};
};

export const opGetCommandConfigurations = (
	guildId: string,
	command: string
): SharedRequester<GuildCommandConfiguration[]> => {
	let authData = getAuthCreds();

	return {
		name: `guildCommandConfigurations:${guildId}:${command}`,
		requestFunc: async (): Promise<GuildCommandConfiguration[]> => {
			const res = await fetchClient(
				`${get('splashtail')}/users/${authData?.user_id}/guilds/${guildId}/commands/${command}/configurations`,
				{
					headers: {
						Authorization: `User ${authData?.token}`
					}
				}
			);
			if (!res.ok) {
				let resp: ApiError = await res.json();
				throw new Error(
					formatApiError("Failed to fetch guild command configuration", resp)
				);
			}

			const data: GuildCommandConfiguration[] = await res.json();

			return data;
		},
		shouldCache: false
	};
};
