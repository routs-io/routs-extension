import { localStorage } from "./storage.js"
//import { generateFuelWallet } from "./index.js";
import type { IWallet } from "./types.js";

export const ContentMethods = {
    eth_accounts: async () => {
        const { get } = localStorage;
        const connectedWallets: IWallet[] = await get('connectedWallets') ?? [];

        return connectedWallets.filter(w => w.type === 'evm').map(w => w.address);
    },

    /*fuel_generateAccounts: async (addresses: string[]) => {
        const { get, set } = localStorage;
        const walletsInStorage: IStoredWallet[] = await get('wallets') ?? [];

        const wallets = walletsInStorage.filter(w => addresses.map(a => a.toLowerCase()).includes(w.address.toLowerCase()));

        if (wallets.length === 0) {
            return [];
        }

        const newWallets = wallets.map(w => {
            const wallet = generateFuelWallet(w.privateKey);
            return {
                address: wallet,
                tags: [{ id: 1, name: `${w.address.slice(0, 6)}...${w.address.slice(-4)}`, color: 'green' as TypeTagColor }],
                privateKey: w.privateKey,
                type: 'fuel' as WalletType
            }
        });

        set('wallets', walletsInStorage.concat(newWallets));

        return newWallets;
    }*/
}