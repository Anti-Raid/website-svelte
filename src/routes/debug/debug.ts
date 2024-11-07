import { makeSharedRequest, opGetModules } from '$lib/fetch/ext';
import {
	extractKnownPermissionsFromModules,
	makeKittycatPermissionMapperFromPermissions
} from '$lib/ui/permMap';
import { CommonPermissionContext } from '@components/dashboard/permissions/commonPermissionContext';

export const dbgCreateContext = async () => {
	let modules = await makeSharedRequest(opGetModules());

	let commonPermissionContext: CommonPermissionContext = {
		kittycatPermissionMapper: makeKittycatPermissionMapperFromPermissions(
			extractKnownPermissionsFromModules(Object.values(modules))
		)
	};

	return commonPermissionContext;
};
