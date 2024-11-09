import {
	CanonicalModule,
	FullGuildCommandConfiguration,
	GuildModuleConfiguration
} from '$lib/generated/silverpelt';
import { UserGuildBaseData } from '$lib/generated/types';
import logger from '$lib/ui/logger';
import { CommonPermissionContext } from '../../../../components/dashboard/permissions/commonPermissionContext';
import { State } from '../core/types';

export interface QuickActionProps {
	modules: Record<string, CanonicalModule>;
	commonPermissionContext: CommonPermissionContext;
	guildId: string;
	currentModuleConfiguration: GuildModuleConfiguration[];
	currentCommandConfiguration: FullGuildCommandConfiguration[];
	guildData: UserGuildBaseData;
	setState: (newState: State) => void;
}

export interface QuickAction {
	id: string;
	name: string;
	icon: string;
	description: string;
	component: () => Promise<any>;
}

export const defaultComponent = async () => {
	return import('./Default.svelte');
};

export const quickActions: QuickAction[] = [
	{
		id: 'settings-browser',
		name: 'Settings Browser',
		icon: 'bx:bx-cog',
		description:
			"Easily browse and edit all of your server's settings in one place. No more digging through menus to find what you're looking for!",
		component: async () => {
			let component = await import('./SettingsBrowser.svelte');
			logger.info('QuickActionLoad', component);
			return component.default;
		}
	}
];
