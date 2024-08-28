/**
 * Basic bitflag wrapper to manage bitflags decently
 */
export class BitFlag {
	private flagDescriptors: { [key: string]: number | string } = {};
	private flags: bigint;

	constructor(flagDescriptors: { [key: string]: number | string }, initialFlags: string) {
		this.flagDescriptors = flagDescriptors;
		this.flags = BigInt(initialFlags);
	}

	/**
	 * Sets the flag to the given value
	 */
	public setFlag(flag: string | number, value: boolean) {
		let flagValue: bigint | undefined = undefined;
		for (let flagKey of Object.keys(this.flagDescriptors)) {
			if (flagKey == flag || this.flagDescriptors[flagKey] == flag) {
				flagValue = BigInt(this.flagDescriptors[flagKey]);
				break;
			}
		}

		if (flagValue === undefined) {
			throw new Error(`Unknown flag: ${flag}`);
		}

		if (value) {
			this.flags |= flagValue;
		} else {
			this.flags &= ~flagValue;
		}
	}

	/**
	 * Returns whether the flag is set
	 */
	public isFlagSet(flag: string | number): boolean {
		let flagValue: bigint | undefined = undefined;
		for (let flagKey of Object.keys(this.flagDescriptors)) {
			if (flagKey == flag || this.flagDescriptors[flagKey] == flag) {
				flagValue = BigInt(this.flagDescriptors[flagKey]);
				break;
			}
		}

		if (flagValue === undefined) {
			flagValue = BigInt(flag);
		}

		return (this.flags & flagValue) == flagValue;
	}

	/**
	 * Returns the flags
	 */
	public getFlags(): bigint {
		return this.flags;
	}

	/**
	 * Returns a list of flags that are set
	 */
	public getSetFlags(): Record<string, string> {
		let setFlags: Record<string, string> = {};
		for (let flagKey of Object.keys(this.flagDescriptors)) {
			let flagVal = BigInt(this.flagDescriptors[flagKey]);
			if ((this.flags & flagVal) == flagVal) {
				setFlags[flagKey] = flagVal.toString();
			}
		}

		return setFlags;
	}

	/**
	 * Returns a list of flags that are not set
	 */
	public getUnsetFlags(): Record<string, string> {
		let unsetFlags: Record<string, string> = {};
		for (let flagKey of Object.keys(this.flagDescriptors)) {
			let flagVal = BigInt(this.flagDescriptors[flagKey]);
			if ((this.flags & flagVal) != flagVal) {
				unsetFlags[flagKey] = flagVal.toString();
			}
		}

		return unsetFlags;
	}

	/**
	 * Returns the flag key
	 */
	public getFlagKey(flag: string | number): string {
		for (let flagKey of Object.keys(this.flagDescriptors)) {
			if (flagKey == flag || this.flagDescriptors[flagKey] == flag) {
				return flagKey;
			}
		}

		throw new Error(`Unknown flag: ${flag}`);
	}

	/**
	 * Returns the flag descriptors
	 */
	public getFlagDescriptors(): { [key: string]: string | number } {
		return this.flagDescriptors;
	}
}
