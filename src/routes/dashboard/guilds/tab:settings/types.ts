import { ColumnState, DispatchType } from "$lib/ui/settings";

export type OperationTypes = "View" | "Create" | "Update" | "Delete";

export interface DerivedData {
    dispatchType: DispatchType;
    columnState: ColumnState;
    forceRederive?: boolean;
}