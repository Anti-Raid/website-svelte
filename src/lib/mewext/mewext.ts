// AI converted using https://www.codeconvert.ai/free-converter

import { ClusterMap } from '$lib/generated/mewld/proc';

export function getClusterOfShard(shard: number, clusterMap: ClusterMap[]): number {
	for (const c of clusterMap) {
		for (const s of c.Shards) {
			if (s === shard) {
				return c.ID;
			}
		}
	}
	return -1;
}

export function getShardIDFromGuildID(guildID: string, shardCount: number): [number, Error | null] {
	let gidNum: bigint;
	try {
		gidNum = BigInt(guildID);
	} catch (err) {
		return [0, err as Error];
	}
	return [Number(gidNum >> BigInt(22)) % shardCount, null];
}

// From name_split, construct a list of all permutations of the command name from the root till the end
//
// E.g: If subcommand is `limits hit`, then `limits` and `limits hit` will be constructed
//
//	as the list of commands to check
//
// E.g 2: If subcommand is `limits hit add`, then `limits`, `limits hit` and `limits hit add`
//
//	will be constructed as the list of commands to check
export function permuteCommands(subcommand: string): string[] {
	const parts = subcommand.split(' ');
	const commands = [];
	let command = '';
	for (const part of parts) {
		command += part;
		commands.push(command);
		command += ' ';
	}
	return commands;
}