export const localStorage = {
    async get(key: string) {
        const storage = await chrome.storage.sync.get(key);
        return storage[key];
    },
    async set(key: string, value: unknown) {
        await chrome.storage.sync.set({ [key]: value });
    },
    async listen(callback: (arg: any) => void) {
        chrome.storage.onChanged.addListener((changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
            if (changes[areaName]) {
                callback(changes[areaName].newValue);
            }
        });
    }
};