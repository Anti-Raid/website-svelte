import { CanonicalModule, PermissionChecks } from '$lib/generated/silverpelt';
import { title } from '$lib/strings';
import logger from './logger';

export interface KittycatPermissionMapper {
	namespace_id: string; // The namespace ID (backup/limits etc.)
	namespace_label: string; // The namespace label (Backups, Limits etc.)
	permissions: {
		id: string; // The permission ID (create, delete etc.)
		label: string; // The permission label (Create, Delete etc.)
	}[];
}

/**
 * Helper function to extract permissions from permission checks
 * @param permissionChecks The permission checks to extract permissions from
 * @returns The permissions extracted from the permission checks
 */
const extractPermissionsFromPermissionChecks = (permissionChecks: PermissionChecks) => {
	if (!permissionChecks?.Simple) {
		return [];
	}

	let permissions: string[] = [];

	for (let check of permissionChecks?.Simple?.checks) {
		for (let permission of check?.kittycat_perms) {
			permissions.push(permission);
		}
	}

	return permissions;
};

/**
 * Extract known permissions from modules for further processing
 *
 * @param modules The modules to extract known permissions from
 * @returns The known permissions extracted from the modules
 */
export const extractKnownPermissionsFromModules = (modules: CanonicalModule[]) => {
	let permissions: string[] = [];

	for (let module of modules) {
		for (let command of module?.commands) {
			for (let [key, value] of Object.entries(command?.extended_data)) {
				logger.debug(
					'extractKnownPermissionsFromModules',
					'Parsing permissions from command: ',
					key,
					value
				);
				permissions = permissions.concat(
					extractPermissionsFromPermissionChecks(value?.default_perms)
				);
			}
		}
	}

	return permissions;
};

export const makeKittycatPermissionMapperFromPermissions = (
	permissions: string[]
): KittycatPermissionMapper[] => {
	let kittycatPermissionMapper: KittycatPermissionMapper[] = [];

	// Map namespaces with a list of permissions
	let namespacePermissionMap: { [key: string]: string[] } = {};

	// Iterate over permissions to build the namespacePermissionMap
	for (let permission of permissions) {
		const { namespace, permission: perm } = unwindPerm(permission);

		if (!namespacePermissionMap[namespace]) {
			namespacePermissionMap[namespace] = [];
		}

		namespacePermissionMap[namespace].push(perm);
	}

	// Iterate over the namespacePermissionMap to build the KittycatPermissionMapper
	for (let [namespace, permissions] of Object.entries(namespacePermissionMap)) {
		let namespaceLabel = title(namespace.replaceAll('_', ' '));

		let namespacePermissions: {
			id: string;
			label: string;
		}[] = [];

		let addedPerms: { [key: string]: boolean } = {};
		for (let permission of permissions) {
			if (permission == '*') {
				continue;
			}

			if (addedPerms[permission]) {
				continue;
			}

			addedPerms[permission] = true;

			let permissionLabel = title(permission.replaceAll('_', ' '));

			namespacePermissions.push({
				id: permission,
				label: permissionLabel
			});
		}

		kittycatPermissionMapper.push({
			namespace_id: namespace,
			namespace_label: namespaceLabel,
			permissions: namespacePermissions
		});
	}

	return kittycatPermissionMapper;
};

// Given a perm string, extract it to its components
export const unwindPerm = (perm: string) => {
	const split = perm.split('.');

	let namespace = split[0]; // Namespace is always the first part of the permission

	let negator: boolean = false;
	let permission: string = '';
	let validPerm: boolean = false;
	let scope: string = '';

	if (namespace.startsWith('~')) {
		negator = true;
		namespace = namespace.substring(1);
	}

	if (split.length == 2) {
		permission = split[1];
		validPerm = true;

		// Handle scope (perm#scope form)
		if (permission.includes('#')) {
			const splitPermission = permission.split('#');
			permission = splitPermission[0];
			scope = splitPermission[1];
		} else {
			scope = '';
		}
	}

	return {
		namespace,
		permission,
		scope,
		negator,
		validPerm
	};
};

// Given the parts of a permission, rewind it to a perm string
export const rewindPerms = (
	namespace: string,
	permission: string,
	scope: string,
	negator: boolean
) => {
	let base: string;
	if (permission) {
		base = `${negator ? '~' : ''}${namespace}.${permission}`;
	} else {
		base = `${negator ? '~' : ''}${namespace}`;
	}

	// Handle scope (perm#scope form)
	if (scope && permission) {
		base = `${base}#${scope}`;
	}

	return base;
};
