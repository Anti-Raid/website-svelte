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
    if (openedEntity.module) return `module.${openedEntity.module.id}.${openedEntity.module.tab}`;
    if (openedEntity.quickAction) return `quickAction.${openedEntity.quickAction.id}`;
    if (openedEntity.mobileSidebar) return "mobileSidebar";
    return "none";
}

export const stringToOpenedEntity = (str: string): OpenedEntity => {
    let split = str.split(".")

    switch (split[0]) {
        case "indexPage":
            return { indexPage: {} };
        case "mobileSidebar":
            return { mobileSidebar: {} };
        case "module":
            if (split.length === 1) return { indexPage: {} };
            if (split.length === 2) return { module: { id: split[1], tab: "info" } };
            return { module: { id: split[1], tab: split[2] } };
        case "quickAction":
            if (split.length === 1) return { indexPage: {} };
            return { quickAction: { id: split[1] } };
        default:
            return { indexPage: {} }; // Default to index page
    }
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