//import 'chrome';
import { defineStore } from "pinia"

export const useStorageStore = defineStore('storage', {
    actions: {
        async get(key: string) {
            const storage = await chrome.storage.sync.get();
            return storage[key];
        },
        async set(key: string, value: unknown) {
            let storage = await this.get(key);
            console.log(storage);
            if (Array.isArray(storage)) {
                storage.push(value);
            } else {
                storage = value;
            }
            await chrome.storage.sync.set({ [key]: storage });
        },
        async listen(callback: (arg: any) => void) {
            chrome.storage.onChanged.addListener((changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
                if (changes[areaName]) {
                    callback(changes[areaName].newValue);
                }
            });
        }
    }
});