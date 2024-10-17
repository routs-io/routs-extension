import { defineStore } from "pinia"
import { useStorageStore } from "./storage";
import type { IWalletsStore } from "@/types/wallets";
import { Wallet } from "ethers";

export const useWalletsStore = defineStore('wallets', {
    state: (): IWalletsStore => ({
        wallets: [],
        checkedWallets: [],
        requestId: 0
    }),
    actions: {
        async saveWallets(privateKeys: string[]) {
            const { get, set } = useStorageStore();

            const walletsInStorage: { address: string, privateKey: string }[] = await get('wallets') ?? [];
            console.log('saveWallets 1', walletsInStorage);
            console.log('saveWallets 2', privateKeys.map(pk => ({ address: new Wallet(pk).address, privateKey: pk })))
            await set(
                'wallets',
                Array.from(
                    new Set([
                        ...walletsInStorage.map(w => JSON.stringify(w)),
                        ...privateKeys.map(pk => JSON.stringify({ address: new Wallet(pk).address, privateKey: pk }))
                    ])
                ).map(w => JSON.parse(w))
            );
            this.wallets = privateKeys.map(pk => new Wallet(pk).address);
        },

        async getWalletByAddress(address: string): Promise<Wallet> {
            const { get } = useStorageStore();
            const wallets: { address: string, privateKey: string }[] = await get('wallets');
            const wallet = wallets.find(w => w.address === address);
            if (!wallet) {
                throw new Error('Wallet not found');
            }
            return new Wallet(wallet.privateKey);
        },

        async refreshWallets(id: number) {
            console.log('refreshWallets', id);
            this.requestId = id;
            const { get } = useStorageStore();
            const wallets: { address: string, privateKey: string }[] = await get('wallets');
            this.wallets = wallets.map(w => w.address);
        },

        async sendWalletsToPage() {
            console.log('sendWalletsToPage', this.requestId);
            const response = await chrome.runtime.sendMessage({ id: this.requestId, action: 'getWallets', data: this.checkedWallets, direction: 'out' });  
            console.log('sendWalletsToPage', response);
        }
    }
})