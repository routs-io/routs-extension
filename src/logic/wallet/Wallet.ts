import { useStorageStore } from "@/stores/storage";
import type { IStoredWallet, ITag, TypeTagColor, WalletStatus, WalletType } from "@/types/wallets";
import type { FormattedWallet, IWallet } from "./types";

export default abstract class Wallet implements IWallet {
    address: string;
    tags: ITag[] = [];
    type: WalletType;
    status: WalletStatus = 'offline';
    private privateKey: string;
    checked: boolean = false;

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
        this.address = "Not initialized";
        this.type = this.getType();
        this.initAddress(pk);
    }

    private async initAddress(pk: string) {
        this.address = await this.generateAddress(pk);
    }

    static readonly AVAILABLE_SIGNER_TYPES: string[] = ['evm', 'sol']

    protected abstract generateAddress(privateKey: string): Promise<string>;

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

    format(): FormattedWallet {
        return {
            address: this.address,
            tags: this.tags,
            type: this.type
        };
    }

    // Returns the wallet type
    protected abstract getType(): WalletType;
}