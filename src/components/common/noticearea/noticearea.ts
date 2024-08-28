import logger from '$lib/ui/logger';

export interface NoticeProps {
	className?: string;
	text: string;
	level: NoticeAreaLevels;
	disabled?: boolean;
	disable_html?: boolean;
}

export type NoticeAreaLevels = 'loading' | 'info' | 'warn' | 'error' | 'success';

// Used for debugging purposes
export const noticeAreaLevelsArray: NoticeAreaLevels[] = [
	'loading',
	'info',
	'warn',
	'error',
	'success'
];

export interface Display {
	icon: string;
	borderColor: string;
	innerBackgroundColor: string;
	iconColor: string;
	className: string;
}

export const getDisplay = (
	level: NoticeAreaLevels,
	className?: string,
	disabled?: boolean
): Display => {
	logger.info(
		'getDisplay',
		'Getting display for level',
		level,
		'with class name',
		className,
		'and disabled',
		disabled
	);
	switch (level) {
		case 'loading':
			return {
				icon: 'mdi:loading',
				iconColor: 'text-primary-200 animate-spin',
				borderColor: 'border-primary-500',
				innerBackgroundColor: 'bg-primary-500',
				className:
					(className ? className + ' ' : '') + (disabled ? 'cursor-not-allowed animate-pulse' : '')
			};
		case 'info':
			return {
				icon: 'mdi:information',
				iconColor: 'text-secondary-200',
				borderColor: 'border-secondary-500',
				innerBackgroundColor: 'bg-secondary-500',
				className: className + (disabled ? 'cursor-not-allowed animate-pulse' : '')
			};
		case 'warn':
			return {
				icon: 'mdi:alert',
				iconColor: 'text-warning-200',
				borderColor: 'border-warning-500',
				innerBackgroundColor: 'bg-warning-500',
				className: className + (disabled ? 'cursor-not-allowed animate-pulse' : '')
			};
		case 'error':
			return {
				icon: 'mdi:cross-circle',
				iconColor: 'text-error-200',
				borderColor: 'border-error-500',
				innerBackgroundColor: 'bg-error-500',
				className: className + (disabled ? 'cursor-not-allowed animate-pulse' : '')
			};
		case 'success':
			return {
				icon: 'mdi:check',
				iconColor: 'text-success-200',
				borderColor: 'border-success-500',
				innerBackgroundColor: 'bg-success-500',
				className: className + (disabled ? 'cursor-not-allowed animate-pulse' : '')
			};
	}
};
