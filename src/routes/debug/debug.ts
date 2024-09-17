import { makeSharedRequest, opGetClusterModules } from '$lib/fetch/ext';
import {
	extractKnownPermissionsFromModules,
	makeKittycatPermissionMapperFromPermissions
} from '$lib/ui/permMap';
import { CommonPermissionContext } from '../../components/dashboard/permissions/commonPermissionContext';

export const dbgCreateContext = async () => {
	let clusterModules = await makeSharedRequest(opGetClusterModules(0));

	let commonPermissionContext: CommonPermissionContext = {
		kittycatPermissionMapper: makeKittycatPermissionMapperFromPermissions(
			extractKnownPermissionsFromModules(Object.values(clusterModules))
		)
	};

	return commonPermissionContext;
};
