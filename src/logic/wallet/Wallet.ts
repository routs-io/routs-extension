import { useStorageStore } from "@/stores/storage";
import type { IStoredWallet, ITag, TypeTagColor, WalletStatus, WalletType } from "@/types/wallets";
import type { IWallet } from "./types";

export default abstract class Wallet implements IWallet {
    address: string;
    tags: ITag[] = [];
    type: WalletType;
    status: WalletStatus = 'offline';
    private privateKey: string;
    checked?: boolean;

    constructor(private pk?: string) {
        if(!pk) {
            pk = this.generatePrivateKey();
            console.log('pk', pk);
            this.tags.push({
                id: 0,
                name: 'Generated',
                color: 'green' as TypeTagColor
            });
        }
        this.privateKey = pk;
        this.address = this.generateAddress(pk);
        this.type = this.getType();
    }

    static readonly AVAILABLE_SIGNER_TYPES: string[] = ['evm']

    protected abstract generateAddress(privateKey: string): string;

    protected abstract getSigner(): Promise<unknown>;

    abstract signTransaction(transaction: object): Promise<string>;

    protected abstract generatePrivateKey(): string;

    async getPrivateKey(): Promise<string> {
        const { get } = useStorageStore()
        const wallets: IStoredWallet[] = await get('wallets')
        const wallet = wallets.find((w) => w.address.toLowerCase() === this.address.toLowerCase())
        if (!wallet) {
            return this.privateKey;
        }
        return wallet.privateKey;
    }

    // Returns the wallet type
    protected abstract getType(): WalletType;
}