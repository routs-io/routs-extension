import 'chrome';

export const localStorage = {
    get: async (key: string) => {
        const storage = await chrome.storage.sync.get();
        return storage[key];
    },
    set: async (key: string, value: unknown) => {
        let storage = await localStorage.get(key);
        console.log(storage);
        if (Array.isArray(storage)) {
            storage.push(value);
        } else {
            storage = value;
        }
        await chrome.storage.sync.set({ [key]: storage });
    },
    listen: (callback: (arg: any) => void) => {
        chrome.storage.onChanged.addListener((changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
            if (changes[areaName]) {
                callback(changes[areaName].newValue);
            }
        });
    },
};