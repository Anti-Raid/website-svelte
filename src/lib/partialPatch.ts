import isEqual from 'lodash.isequal';
import logger from './ui/logger';
import { Clearable } from './generated/types';

export interface ParsedPartialPatch<T> {
	key: any;
	value: Clearable<T>;
}

// T = type, U = underlying type
export interface PartialPatch<T, U> {
	initial: T;
	current: T;

	/**
	 * Parse the value to the patched value that should be sent to the API
	 */
	parse?: (
		state: PartialPatchRecord<U>,
		snapshot: Snapshot<U>,
		value: T
	) => ParsedPartialPatch<T> | null;
}

export type Snapshot<T> = {
	[P in keyof T]: T[P];
};

export type PartialPatchRecord<T> = {
	[P in keyof T]: PartialPatch<T[P], T>;
};

/**
 * Creates a partial patch from a patch record
 *
 * @example const createPatch = createPartialPatch(state);
 */
export const createPartialPatch = <T>(
	patch: PartialPatchRecord<T>
): ParsedPartialPatch<T[keyof T]> => {
	let createdPatch: ParsedPartialPatch<T[keyof T]> = {} as ParsedPartialPatch<T[keyof T]>;

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
		if (!value.parse) {
			throw new Error('No parse function provided for value');
		}

		let parsedInitial = value.parse(patch, initialSnapshot, value.initial);
		let parsedCurrent = value.parse(patch, currentSnapshot, value.current);

		if (!parsedInitial || !parsedCurrent) {
			continue;
		}

		logger.info(
			'createPartialPatch',
			'Parsed initial value',
			parsedInitial?.value,
			'Parsed current value',
			parsedCurrent?.value
		);

		if (!isEqual(parsedInitial?.value, parsedCurrent?.value)) {
			// @ts-ignore
			createdPatch[parsedCurrent.key] = parsedCurrent?.value;
		}
	}

	return createdPatch;
};
