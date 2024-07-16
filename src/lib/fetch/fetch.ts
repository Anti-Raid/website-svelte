import { ApiError } from '$lib/generated/types';
import logger from '../ui/logger';
import { PermissionCheck, PermissionChecks, PermissionResult } from '$lib/generated/silverpelt';
import dompurify from 'dompurify';
import * as marked from 'marked';
import { BitFlag } from '$lib/bitflag';
import serenityPermissions from '$lib/generated/build_assets/serenity_perms.json';

const { sanitize } = dompurify;

interface FetchClientOptions extends RequestInit {
	auth?: string;
	noExtraHeaders?: boolean;
	noWait?: boolean;
	onRatelimit?: (n: number, err: ApiError) => void;
}

class PermissionCheckFormatter {
	public permCheck: PermissionCheck;
	constructor(permCheck: PermissionCheck) {
		this.permCheck = permCheck;
	}

	get nativePerms() {
		return this.permCheck.native_perms;
	}

	get kittycatPerms() {
		return this.permCheck.kittycat_perms;
	}

	get innerAnd() {
		return this.permCheck.inner_and;
	}

	get outerAnd() {
		return this.permCheck.outer_and;
	}

	toString() {
		let result = '';

		if (this.nativePerms.length > 0) {
			result += '\t- Discord: ';
			this.nativePerms.forEach((perm, index) => {
				if (index !== 0) {
					result += ' ';
				}
				let permsBf = new BitFlag(serenityPermissions, perm);
				result += `${Object.keys(permsBf.getSetFlags())} (${perm})`;
				if (index < this.nativePerms.length - 1) {
					result += this.innerAnd ? ' AND' : ' OR';
				}
			});
		}

		if (this.kittycatPerms.length > 0) {
			result += '\n\t- Custom Permissions (kittycat): ';
			this.kittycatPerms.forEach((perm, index) => {
				if (index !== 0) {
					result += ' ';
				}
				result += perm;
				if (index < this.kittycatPerms.length - 1) {
					result += this.innerAnd ? ' AND' : ' OR';
				}
			});
		}

		return result;
	}
}

class PermissionChecksFormatter {
	public checks: PermissionChecks;
	constructor(checks: PermissionChecks) {
		this.checks = checks;
	}

	get checksNeeded() {
		return this.checks.checks_needed;
	}

	toString() {
		let checks = this.checks.checks
			.map((c, index) => {
				let check = new PermissionCheckFormatter(c);

				let result = `${index + 1}.\n${check.toString()}`;
				let empty = check.kittycatPerms.length === 0 && check.nativePerms.length === 0;
				if (index < this.checks.checks.length - 1 && !empty) {
					result += check.outerAnd ? ' AND ' : ' OR ';
				}
				return result;
			})
			.join(' ');

		checks += `\n\n**Checks Needed**: ${this.checksNeeded}`;
		return checks
	}
}

/**
 * A wrapper to help format a permission result
 */
export class PermissionResultFormatter {
	private result: PermissionResult;

	constructor(result: PermissionResult) {
		this.result = result;
	}

	toMarkdown() {
		let checksFmt: PermissionChecksFormatter;
		switch (this.result.var) {
			case 'Ok':
				return 'No message/context available';
			case 'OkWithMessage':
				return this.result.message;
			case 'MissingKittycatPerms':
			case 'MissingNativePerms':
			case 'MissingAnyPerms':
				if (!this.result.checks) throw new Error('Missing checks for permission result');
				checksFmt = new PermissionChecksFormatter(this.result.checks);
				return `You do not have the required permissions to perform this action. Try checking that you have the below permissions: ${checksFmt.toString()}`;
			case 'CommandDisabled':
				return `You cannot perform this action because the command \`\`${this.result.command_config?.command}\`\` is disabled on this server`;
			case 'UnknownModule':
				return `The module \`\`${this.result.module_config?.module}\`\` does not exist`;
			case 'ModuleNotFound':
				return `The module corresponding to this command could not be determined!`;
			case 'ModuleDisabled':
				return `The module \`\`${this.result.module_config?.module}\`\` is disabled on this server`;
			case 'NoChecksSucceeded':
				if (!this.result.checks) throw new Error('Missing checks for permission result');
				checksFmt = new PermissionChecksFormatter(this.result.checks);
				return `You do not have the required permissions to perform this action. You need at least one of the following permissions to execute this command:\n\n**Required Permissions**:\n\n${checksFmt.toString()}`;
			case 'MissingMinChecks':
				if (!this.result.checks) throw new Error('Missing checks for permission result');
				checksFmt = new PermissionChecksFormatter(this.result.checks);
				return `You do not have the required permissions to perform this action. You need at least ${checksFmt.checksNeeded
					} of the following permissions to perform this action:\n\n**Required Permissions**:\n\n${checksFmt.toString()}`;
			case 'DiscordError':
				return `A Discord-related error seems to have occurred: ${this.result.error}.\n\nPlease try again later, it might work!`;
			case 'SudoNotGranted':
				return 'This module is only available for root (staff) and/or developers of the bot'
			case 'GenericError':
				return this.result.error;
		}
	}

	/**
	 * Formats the permission result
	 *
	 * @param type The type of formatting to use, either markdown or html
	 * @returns The formatted permission result
	 */
	async format(type: 'markdown' | 'html'): Promise<string> {
		let md = `${this.toMarkdown()}\n\n\n\n**Code:** ${this.result.var}`;

		logger.info('PermissionResultFormatter', 'Formatting', md);

		if (!md) {
			throw new Error('Failed to format permission result, md is null/undefined');
		}

		if (type === 'html') {
			let outHtml = await marked.parse(md, {
				async: true,
				breaks: true
			});

			return outHtml;
		}

		return md;
	}
}

/**
 * A wrapper around the fetch API for convenience purposes
 */
export class ClientResponse {
	private response: Response;
	readonly errorType: string | null;

	constructor(response: Response) {
		this.response = response;
		this.errorType = response.headers.get('X-Error-Type');
	}

	get status(): number {
		return this.response.status;
	}

	/**
	 * Returns whether or not the request was successful.
	 *
	 * This also handles edge-cases such as HTTP 200 yet being an error
	 */
	get ok(): boolean {
		return this.response.ok && !this.errorType;
	}

	/**
	 * Formats a response
	 *
	 * @returns The error message if the request was not successful
	 */
	async error(base?: string, type?: 'markdown' | 'html'): Promise<string> {
		if (this.ok) {
			throw new Error(`Cannot call error() when response.ok is true`);
		}

		logger.info('ClientResponse', 'Error', this.errorType);

		if (!type) {
			type = 'html';
		}

		if (this.errorType) {
			switch (this.errorType) {
				case 'permission_check':
					let json = await this.response.json();
					logger.info('ClientResponse', 'Permission check error', json);
					let fmt = new PermissionResultFormatter(json);
					let formatted = await fmt.format(type);

					let outHtml = sanitize(formatted);

					// Add some formatting for ol/ul
					outHtml = outHtml
						.replaceAll('<ol', "<ol class='list-decimal pl-6 mb-2'")
						.replaceAll('<ul', "<ul class='pl-1'");

					return outHtml;
			}
		}

		try {
			let json: ApiError = await this.response.json();

			if (type == 'html') {
				let htmlOut = await marked.parse(this.formatApiError(base || 'Error', json));
				let sanitized = sanitize(htmlOut);

				// Ensure that the error message is wrapped in a paragraph
				if (!sanitized.startsWith('<p')) {
					sanitized = `<p class="mb-2">${sanitized}</p>`;
				}

				return sanitized;
			}

			return sanitize(this.formatApiError(base || 'Error', json));
		} catch (err) {
			return `${base || 'Error'}: ${this.response.statusText} (${err})`;
		}
	}

	private formatApiError(base: string, err: ApiError) {
		if (err?.context) {
			return `${base}: ${err.message} [${err.context}]`;
		} else {
			return `${base}: ${err.message}`;
		}
	}

	async json(): Promise<any> {
		if (!this.ok) {
			throw new Error(`Cannot call json() when response.ok is false`);
		}
		return this.response.json();
	}
}

export async function fetchClient(
	url: string,
	options?: FetchClientOptions
): Promise<ClientResponse> {
	let rawOptions = options;

	if (!options) {
		options = {};
	}

	let headers: Record<string, string> = {};

	if (!options?.noExtraHeaders) {
		headers['Content-Type'] = 'application/json';
	}

	if (options.headers) {
		headers = {
			...headers,
			...(options.headers as Record<string, string>)
		};
	}

	let modifier = '';

	if (options.auth) {
		headers['Authorization'] = `User ${options.auth}`;
		modifier += ' (authorized)';
	} else {
		if (headers['Authorization']) {
			throw new Error('options.auth must be used for auth');
		}
	}

	logger.info(
		'FetchClient',
		options.method ? options.method.toUpperCase() + modifier : 'GET' + modifier,
		url
	);

	try {
		const res = await fetch(url, {
			headers: headers,
			...options
		});

		if ([408, 502, 503, 504].includes(res.status)) {
			throw new Error('Server currently undergoing maintenance');
		}

		if (res.headers.get('Retry-After') && !options?.noWait) {
			logger.info('FetchClient', 'Rate limited', res.headers.get('Retry-After'), res.headers);
			let retryAfter = res.headers.get('Retry-After');

			if (retryAfter) {
				let err: ApiError = await res.json();

				let n = parseFloat(retryAfter || '3') * 1000;

				if (options.onRatelimit) {
					options.onRatelimit(n, err);
				}

				// Wait for the time specified by the server
				if (!options.noWait) {
					logger.info('FetchClient', `Rate limited, waiting ${retryAfter} seconds`);
					await new Promise((resolve) => setTimeout(resolve, n));

					if (options.onRatelimit) {
						options.onRatelimit(0, err);
					}

					return await fetchClient(url, rawOptions);
				}
			}
		}

		return new ClientResponse(res);
	} catch (err) {
		logger.error('FetchClient', 'Error', err);
		throw err;
	}
}
