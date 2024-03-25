import { CommandExtendedData, CommandExtendedDataMap } from "./generated/silverpelt";

export interface CanonicalCommandExtendedData extends CommandExtendedData {
    id: string
}

export const mapToCanonicalCommandExtendedData = (data: CommandExtendedDataMap): CanonicalCommandExtendedData[] => {
    return Object.entries(data).map(([id, value]) => {
        return {
            id,
            ...value
        }
    })
}