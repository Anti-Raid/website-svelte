import { FullGuildCommandConfiguration } from "$lib/generated/silverpelt";
import { LookedUpCommand, ParsedCanonicalCommandData } from "$lib/ui/commands";

export interface OpenedEntity {
    indexPage?: {};
    module?: { id: string; tab: string };
    quickAction?: { id: string };
    mobileSidebar?: {};
}

export const openedEntityToString = (openedEntity: OpenedEntity): string => {
    if (openedEntity.indexPage) return "indexPage";
    if (openedEntity.module) return `module:${openedEntity.module.id}-${openedEntity.module.tab}`;
    if (openedEntity.quickAction) return `quickAction:${openedEntity.quickAction.id}`;
    if (openedEntity.mobileSidebar) return "mobileSidebar";
    return "none";
}

export const stringToOpenedEntity = (str: string): OpenedEntity => {
    if (str === "indexPage") return { indexPage: {} };
    if (str === "mobileSidebar") return { mobileSidebar: {} };
    const moduleMatch = str.match(/^module:(.+)-(.+)$/);
    if (moduleMatch) return { module: { id: moduleMatch[1], tab: moduleMatch[2] } };
    const quickActionMatch = str.match(/^quickAction:(.+)$/);
    if (quickActionMatch) return { quickAction: { id: quickActionMatch[1] } };
    return { indexPage: {} }; // default to index page
}

export interface State {
    openedEntity: OpenedEntity;
    commandSearch: string;
    searchedCommands: LookedUpCommand[];
    commandEditOpen?: ParsedCanonicalCommandData;
    commandEditConfigs: FullGuildCommandConfiguration[];
    commandEditorOpen: boolean;
}

export const defaultState = (): State => {
    return {
        openedEntity: { indexPage: {} },
        commandSearch: '',
        searchedCommands: [],
        commandEditorOpen: false,
        commandEditConfigs: []
    };
}