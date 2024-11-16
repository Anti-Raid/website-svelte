import { ApiError } from '$lib/generated/types';
import logger from '../ui/logger';
import {
	CanonicalSettingsError,
	PermissionCheck,
	PermissionResult
} from '$lib/generated/silverpelt';
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

export class PermissionCheckFormatter {
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

/**
 * A wrapper to help format a permission result
 */
export class PermissionResultFormatter {
	private result: PermissionResult;

	constructor(result: PermissionResult) {
		this.result = result;
	}

	toMarkdown() {
		switch (this.result.var) {
			case 'Ok':
				return 'No message/context available';
			case 'OkWithMessage':
				return this.result.message;
			case 'MissingKittycatPerms':
			case 'MissingNativePerms':
			case 'MissingAnyPerms':
				if (!this.result.check) throw new Error('Missing checks for permission result');
				let checksFmt1 = new PermissionCheckFormatter(this.result.check);
				return `You do not have the required permissions to perform this action. Try checking that you have the below permissions: ${checksFmt1.toString()}`;
			case 'CommandDisabled':
				return `You cannot perform this action because the command \`\`${this.result.command_config?.command}\`\` is disabled on this server`;
			case 'UnknownModule':
				return `The module \`\`${this.result.module_config?.module}\`\` does not exist`;
			case 'ModuleNotFound':
				return `The module corresponding to this command could not be determined!`;
			case 'ModuleDisabled':
				return `The module \`\`${this.result.module_config?.module}\`\` is disabled on this server`;
			case 'DiscordError':
				return `A Discord-related error seems to have occurred: ${this.result.error}.\n\nPlease try again later, it might work!`;
			case 'SudoNotGranted':
				return 'This module is only available for root (staff) and/or developers of the bot';
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

export class SettingsErrorFormatter {
	/*
		match self {
			SettingsError::Generic { message, src, typ } => {
				write!(f, "`{}` from src `{}` of type `{}`", message, src, typ)
			}
			SettingsError::OperationNotSupported { operation } => {
				write!(f, "Operation `{}` is not supported", operation)
			}
			SettingsError::SchemaTypeValidationError {
				column,
				expected_type,
				got_type,
			} => write!(
				f,
				"Column `{}` expected type `{}`, got type `{}`",
				column, expected_type, got_type
			),
			SettingsError::SchemaNullValueValidationError { column } => {
				write!(f, "Column `{}` is not nullable, yet value is null", column)
			}
			SettingsError::SchemaCheckValidationError {
				column,
				check,
				error,
				accepted_range,
			} => {
				write!(
					f,
					"Column `{}` failed check `{}`, accepted range: `{}`, error: `{}`",
					column, check, accepted_range, error
				)
			}
			SettingsError::MissingOrInvalidField { field, src } => write!(f, "Missing (or invalid) field `{}` with src: `{}`", field, src),
			SettingsError::RowExists { column_id, count } => write!(
				f,
				"A row with the same column `{}` already exists. Count: `{}`",
				column_id, count
			),
			SettingsError::RowDoesNotExist { column_id } => {
				write!(f, "A row with the same column `{}` does not exist", column_id)
			}
			SettingsError::MaximumCountReached { max, current } => write!(
				f,
				"The maximum number of entities this server may have (`{}`) has been reached. This server currently has `{}`.",
				max, current
			),
		}
	*/

	private error: CanonicalSettingsError;

	constructor(error: CanonicalSettingsError) {
		this.error = error;
	}

	toMarkdown() {
		if (this.error.Generic) {
			return `An error occurred: \`${this.error.Generic.message}\` from src \`${this.error.Generic.src}\` of type \`${this.error.Generic.typ}\``;
		} else if (this.error.OperationNotSupported) {
			return `Operation \`${this.error.OperationNotSupported.operation}\` is not supported`;
		} else if (this.error.SchemaTypeValidationError) {
			return `Column \`${this.error.SchemaTypeValidationError.column}\` expected type \`${this.error.SchemaTypeValidationError.expected_type}\`, got type \`${this.error.SchemaTypeValidationError.got_type}\``;
		} else if (this.error.SchemaNullValueValidationError) {
			return `Column \`${this.error.SchemaNullValueValidationError.column}\` is not nullable, yet value is null`;
		} else if (this.error.SchemaCheckValidationError) {
			return `Column \`${this.error.SchemaCheckValidationError.column}\` failed check \`${this.error.SchemaCheckValidationError.check}\`, accepted range: \`${this.error.SchemaCheckValidationError.accepted_range}\`, error: \`${this.error.SchemaCheckValidationError.error}\``;
		} else if (this.error.MissingOrInvalidField) {
			return `Missing (or invalid) field \`${this.error.MissingOrInvalidField.field}\` with src: \`${this.error.MissingOrInvalidField.src}\``;
		} else if (this.error.RowExists) {
			return `A row with the same column \`${this.error.RowExists.column_id}\` already exists. Count: \`${this.error.RowExists.count}\``;
		} else if (this.error.RowDoesNotExist) {
			return `A row with the same column \`${this.error.RowDoesNotExist.column_id}\` does not exist`;
		} else if (this.error.MaximumCountReached) {
			return `The maximum number of entities this server may have (\`${this.error.MaximumCountReached.max}\`) has been reached. This server currently has \`${this.error.MaximumCountReached.current}\`.`;
		} else {
			return `Unknown error: ${JSON.stringify(this.error)}`;
		}
	}

	get code() {
		if (this.error.Generic) {
			return 'Generic';
		} else if (this.error.OperationNotSupported) {
			return 'OperationNotSupported';
		} else if (this.error.SchemaTypeValidationError) {
			return 'SchemaTypeValidationError';
		} else if (this.error.SchemaNullValueValidationError) {
			return 'SchemaNullValueValidationError';
		} else if (this.error.SchemaCheckValidationError) {
			return 'SchemaCheckValidationError';
		} else if (this.error.MissingOrInvalidField) {
			return 'MissingOrInvalidField';
		} else if (this.error.RowExists) {
			return 'RowExists';
		} else if (this.error.RowDoesNotExist) {
			return 'RowDoesNotExist';
		} else if (this.error.MaximumCountReached) {
			return 'MaximumCountReached';
		} else {
			if (Object.keys(this.error).length === 0) {
				return 'Unknown';
			}
			return Object.keys(this.error)[0];
		}
	}

	/**
	 * Formats the permission result
	 *
	 * @param type The type of formatting to use, either markdown or html
	 * @returns The formatted permission result
	 */
	async format(type: 'markdown' | 'html'): Promise<string> {
		let md = `${this.toMarkdown()}\n\n\n\n**Code:** ${this.code}`;

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
				case 'settings_error':
					let settingsErr: CanonicalSettingsError = await this.response.json();
					let settingsFmt = new SettingsErrorFormatter(settingsErr);
					let settingsFormatted = await settingsFmt.format(type);

					let settingsHtml = sanitize(settingsFormatted);

					// Add some formatting for ol/ul
					settingsHtml = settingsHtml
						.replaceAll('<ol', "<ol class='list-decimal pl-6 mb-2'")
						.replaceAll('<ul', "<ul class='pl-1'");

					return settingsHtml;
			}
		}

		try {
			let json: ApiError = await this.response.json();

			if (type == 'html') {
				let htmlOut = await marked.parse(this.formatApiError(base || '', json));
				let sanitized = sanitize(htmlOut);

				// Ensure that the error message is wrapped in a paragraph
				if (!sanitized.startsWith('<p')) {
					sanitized = `<p class="mb-2">${sanitized}</p>`;
				}

				return sanitized;
			}

			return sanitize(this.formatApiError(base || '', json));
		} catch (err) {
			if (base) {
				return `${base}: ${this.response.statusText} (${err})`;
			}

			return `${this.response.statusText} (${err})`;
		}
	}

	private formatApiError(base: string, err: ApiError) {
		if (err?.context) {
			if (base) {
				return `${base}: ${err.message} [${err.context}]`;
			}
			return `${err.message} [${err.context}]`;
		} else {
			if (base) {
				return `${base}: ${err.message}`;
			}
			return `${err.message}`;
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

		let retryAfter = res.headers.get('Retry-After');
		if (retryAfter) {
			logger.info('FetchClient', 'Rate limited', res.headers.get('Retry-After'), res.headers);
			let retryAfter = res.headers.get('Retry-After');

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

		return new ClientResponse(res);
	} catch (err) {
		logger.error('FetchClient', 'Error', err);
		throw err;
	}
}
