import { FullGuildCommandConfiguration } from "$lib/generated/silverpelt";
import { LookedUpCommand, ParsedCanonicalCommandData } from "$lib/ui/commands";

export interface OpenedEntity {
    indexPage?: {};
    module?: { id: string; tab: string };
    quickAction?: { id: string };
    mobileSidebar?: {};
}

export interface State {
    openedEntity: OpenedEntity;
    commandSearch: string;
    searchedCommands: LookedUpCommand[];
    commandEditOpen?: ParsedCanonicalCommandData;
    commandEditConfigs: FullGuildCommandConfiguration[];
    commandEditorOpen: boolean;
    clusterFinderByGuildIdExpectedData: {
        cluster: number;
        shard: number;
    } | null;
}