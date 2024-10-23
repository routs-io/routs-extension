import { localStorage } from "./storage.js"

export const ContentMethods = {
    eth_accounts: async () => {
        const { get } = localStorage;
        const connectedWallets: {
            address: string,
            tags: {
                id: number
                name: string
                color: string
            },
            status: string
        }[] = await get('connectedWallets') ?? [];

        return connectedWallets;
    }
}