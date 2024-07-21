import { FullGuildCommandConfiguration } from "$lib/generated/silverpelt";
import { LookedUpCommand, ParsedCanonicalCommandData } from "$lib/ui/commands";

export interface OpenedEntity {
    indexPage?: {};
    module?: { id: string; tab: string };
    quickAction?: { id: string };
}

export interface State {
    openedEntity: OpenedEntity;
    commandSearch: string;
    searchedCommands: LookedUpCommand[];
    sidebarOpen: boolean;
    commandEditOpen?: ParsedCanonicalCommandData;
    commandEditConfigs: FullGuildCommandConfiguration[];
    commandEditorOpen: boolean;
    clusterFinderByGuildIdExpectedData: {
        cluster: number;
        shard: number;
    } | null;
}