import isEqual from 'lodash.isequal'

export interface PartialPatch<T> {
    initial: T;
    current: T;
}

export type PartialPatchRecord<T> = Record<string, PartialPatch<T>>;

/**
 * Creates a partial patch from a patch record
 * 
 * @example const createPatch = createPartialPatch(state as PartialPatchRecord<unknown>);
 */
export const createPartialPatch = <T>(patch: PartialPatchRecord<T>) => {
    let createdPatch: Record<string, any> = {};

    for (let [key, value] of Object.entries(patch)) {
        if (!isEqual(value.initial, value.current)) {
            createdPatch[key] = value.current;
        }
    }

    return createdPatch;
};
