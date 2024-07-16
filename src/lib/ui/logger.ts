import { getVersion } from '../configs/functions/versioner';

const log = (level: string, service: string, ...args: any[]) => {
	const timestamp = new Date().toISOString();
	const logStyles: Record<string, string> = {
		debug: 'color: blue; font-weight: bold;',
		info: 'color: green; font-weight: bold;',
		warn: 'color: orange; font-weight: bold;',
		error: 'color: red; font-weight: bold;'
	};

	const style = logStyles[level] || logStyles['info'];

	// @ts-ignore
	console[level](
		`%c[${timestamp}] %c[${level.toUpperCase()}] %c[${service}]`,
		'color: gray; font-weight: bold;',
		style,
		'font-weight: bold;',
		'|',
		...args,
		`[len(args)=${args?.length || 0}, level=${level}, service=${service}, commit=${getVersion()}]`
	);
};

export const debug = (service: string, ...args: any[]) => log('debug', service, ...args);
export const info = (service: string, ...args: any[]) => log('info', service, ...args);
export const warn = (service: string, ...args: any[]) => log('warn', service, ...args);
export const error = (service: string, ...args: any[]) => log('error', service, ...args);

const logger = {
	debug,
	info,
	warn,
	error
};

export default logger;