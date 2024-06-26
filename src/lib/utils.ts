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
 * @example const createPatch = createPartialPatch(state);
 */
export const createPartialPatch = <T>(patch: PartialPatchRecord<T>) => {
    let createdPatch: Record<string, any> = {};

    for (let [key, v] of Object.entries(patch)) {
        let value = v as PartialPatch<T[keyof T]>;

        // Parse the initial and current values
        let parsedInitial = value.parse ? value.parse(value.initial) : { key: key, value: value.initial }
        let parsedCurrent = value.parse ? value.parse(value.current) : { key: key, value: value.current }

        if (!isEqual(parsedInitial?.value, parsedCurrent?.value)) {
            let parsed = value.parse ? value.parse(value.current) : { key: key, value: value.current }
            createdPatch[parsed?.key] = parsed?.value;
        }
    }

    return createdPatch;
};
