import { localStorage } from "./storage.js"
//import { generateFuelWallet } from "./index.js";
import type { IStoredWallet, IWallet } from "./types.js";

export const ContentMethods = {
    eth_accounts: async () => {
        const { get } = localStorage;
        const connectedWallets: IWallet[] = await get('connectedWallets') ?? [];

        return connectedWallets.filter(w => w.type === 'evm').map(w => ({
            address: w.address,
            type: w.type,
            tags: w.tags
        }));
    },

    fuel_accounts: async (evmFilterAddresses?: string[]) => {
        const { get } = localStorage;
        const fuel: IStoredWallet[] = await get('wallets') ?? [];

        return fuel
            .filter(w => w.type === 'fuel' && (!evmFilterAddresses || evmFilterAddresses
                .map(a => `${a.slice(0, 6)}...${a.slice(-4)}`.toLowerCase())
                .includes(w.tags[0].name.toLowerCase())))
            .map(w => evmFilterAddresses ? { address: w.address, index: evmFilterAddresses
                .map(a => `${a.slice(0, 6)}...${a.slice(-4)}`.toLowerCase())
                .indexOf(w.tags[0].name.toLowerCase()) } : w.address);
    },
}