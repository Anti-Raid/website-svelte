import { KittycatPermissionMapper } from "../../../lib/ui/permMap";

/**
 * Common context used by everything dashboard-related. This acts as a place to allow
 * quick addition of properties without needing to recursively update all components.
 */
export interface CommonPermissionContext {
    kittycatPermissionMapper: KittycatPermissionMapper[];
}