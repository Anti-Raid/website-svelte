import { getAuthCreds } from "$lib/auth/getAuthCreds";
import { get } from "$lib/configs/functions/services";
import { fetchClient } from "$lib/fetch/fetch";
import { SettingsExecute, SettingsExecuteResponse } from "$lib/generated/types";
import { ColumnState, DispatchType } from "$lib/ui/settings";

export type OperationTypes = "View" | "Create" | "Update" | "Delete";

export interface DerivedData {
    dispatchType: DispatchType;
    columnState: ColumnState;
    forceRederive?: boolean;
    isCleared: boolean;
}

interface SettingsFetchQueueEntry {
    guildId: string;
    exec: SettingsExecute;
    resolve: (value: SettingsExecuteResponse) => void;
    reject: (reason?: any) => void;
}

class SettingsFetchQueue {
    private cachedSettings: Map<string, SettingsExecuteResponse>;
    private fetchQueue: SettingsFetchQueueEntry[];
    private hasStartedQueue: boolean;

    constructor() {
        this.cachedSettings = new Map();
        this.fetchQueue = []
        this.hasStartedQueue = false;
    }

    async addToQueue(guildId: string, settingsExecute: SettingsExecute): Promise<SettingsExecuteResponse> {
        if (!this.hasStartedQueue) {
            this.processQueue();
        }
        let promise = new Promise<SettingsExecuteResponse>((resolve, reject) => {
            this.fetchQueue.push({ guildId, exec: settingsExecute, resolve, reject });
        });
        return promise;
    }

    private createKey(settingsExecute: SettingsExecute): string | null {
        if (settingsExecute.operation === "View") {
            return JSON.stringify(settingsExecute);
        }
        return null
    }

    private async fetchSetting(guildId: string, settingsExecute: SettingsExecute): Promise<SettingsExecuteResponse> {
        let key = this.createKey(settingsExecute);

        if (key) {
            let cachedSetting = this.cachedSettings.get(key);
            if (cachedSetting) {
                return cachedSetting;
            }
        }

        const creds = getAuthCreds();
        if (!creds) throw new Error('No auth credentials found');

        const res = await fetchClient(`${get('splashtail')}/guilds/${guildId}/settings`, {
            method: 'POST',
            auth: creds?.token,
            body: JSON.stringify(settingsExecute)
        });

        if (!res.ok) {
            let err = await res.error('Failed to fetch settings for this module');
            throw new Error(err);
        }

        const data = await res.json();

        if (key) {
            this.cachedSettings.set(key, data);
        }

        return data;
    }

    private async processQueue() {
        if (this.hasStartedQueue) {
            return; // Ensure we only have one queue running at a time
        }

        this.hasStartedQueue = true;

        while (true) {
            let entry = this.fetchQueue.shift();
            if (!entry) {
                await new Promise(resolve => setTimeout(resolve, 500));
                continue;
            }
            try {
                let data = await this.fetchSetting(entry.guildId, entry.exec);
                entry.resolve(data);
            } catch (e) {
                entry.reject(e);
            }

            // Sleep for 500ms to allow event loop to process other tasks
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }
}

export let settingsFetchQueue = new SettingsFetchQueue();