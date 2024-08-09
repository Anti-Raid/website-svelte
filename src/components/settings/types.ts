import { SettingsExecuteResponse } from "$lib/generated/types";
import { ColumnState, DispatchType } from "$lib/ui/settings";

export type OperationTypes = "View" | "Create" | "Update" | "Delete";

export interface DerivedData {
    dispatchType: DispatchType;
    columnState: ColumnState;
    forceRederive?: boolean;
    isCleared: boolean;
}

export let cachedSettings: Map<string, SettingsExecuteResponse> = new Map(); 