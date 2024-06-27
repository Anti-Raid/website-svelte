import isEqual from 'lodash.isequal'
import logger from './ui/logger';

export interface ParsedPartialPatch {
    key: any;
    value: any;
}

// T = type, U = underlying type
export interface PartialPatch<T, U> {
    initial: T;
    current: T;
    parse?: (state: PartialPatchRecord<U>, snapshot: Snapshot<U>, value: T) => ParsedPartialPatch;
}

export type Snapshot<T> = {
    [P in keyof T]: T[P];
};

export type PartialPatchRecord<T> = {
    [P in keyof T]: PartialPatch<T[P], T>;
};

export interface CreatePartialPatchOpts {
    keepInternalKeys?: boolean; // Don't remove internal keys
}

/**
 * Creates a partial patch from a patch record
 * 
 * @example const createPatch = createPartialPatch(state);
 */
export const createPartialPatch = <T>(patch: PartialPatchRecord<T>, opts?: CreatePartialPatchOpts) => {
    let createdPatch: Record<string, any> = {};

    let initialSnapshot: Snapshot<T> = {} as Snapshot<T>;

    for (let [key, v] of Object.entries(patch)) {
        initialSnapshot[key as keyof T] = (v as PartialPatch<T[keyof T], T>).initial;
    }

    let currentSnapshot: Snapshot<T> = {} as Snapshot<T>;

    for (let [key, v] of Object.entries(patch)) {
        currentSnapshot[key as keyof T] = (v as PartialPatch<T[keyof T], T>).current;
    }

    for (let [key, v] of Object.entries(patch)) {
        let value = v as PartialPatch<T[keyof T], T>;

        // Parse the initial and current values
        let parsedInitial = value.parse ? value.parse(patch, initialSnapshot, value.initial) : { key: key, value: value.initial }
        let parsedCurrent = value.parse ? value.parse(patch, currentSnapshot, value.current) : { key: key, value: value.current }

        logger.info("createPartialPatch", "Parsed initial value", parsedInitial?.value, "Parsed current value", parsedCurrent?.value)

        if (!isEqual(parsedInitial?.value, parsedCurrent?.value)) {
            createdPatch[parsedCurrent?.key] = parsedCurrent?.value;
        }
    }

    if (!opts?.keepInternalKeys) {
        // Remove all internal keys (internal keys are those starting with __)
        for (let key of Object.keys(createdPatch)) {
            if (key.startsWith('__')) {
                delete createdPatch[key];
            }
        }
    }

    return createdPatch;
};
