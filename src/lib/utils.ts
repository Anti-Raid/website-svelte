import isEqual from 'lodash.isequal'

export interface ParsedPartialPatch {
    key: any;
    value: any;
}

export interface PartialPatch<T> {
    initial: T;
    current: T;
    parse?: (value: T) => ParsedPartialPatch;
}

export type PartialPatchRecord<T> = {
    [P in keyof T]: PartialPatch<T[P]>;
};

/**
 * Creates a partial patch from a patch record
 * 
 * @example const createPatch = createPartialPatch(state as PartialPatchRecord<unknown>);
 */
export const createPartialPatch = <T>(patch: PartialPatchRecord<T>) => {
    let createdPatch: Record<string, any> = {};

    for (let [key, v] of Object.entries(patch)) {
        let value = v as any;
        if (!isEqual(value.initial, value.current)) {
            let parsed = value.parse ? value.parse(value.current) : { key: key, value: value.current }
            createdPatch[parsed?.key] = parsed;
        }
    }

    return createdPatch;
};
