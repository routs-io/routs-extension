import { localStorage } from "./storage.js"

export const ContentMethods = {
    eth_accounts: async () => {
        const { get } = localStorage;
        const checkedWallets: string[] = await get('checkedWallets') ?? [];

        return checkedWallets;
    }
}