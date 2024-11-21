import type { WalletType } from "@/types/wallets";
import { Signer as FuelSigner } from '@fuel-ts/signer'
import Wallet from "./Wallet";
import { Buffer } from 'buffer';

export class FuelWallet extends Wallet {
    protected generateAddress(privateKey: string): string {
        const fWallet = new FuelSigner(privateKey)
        return fWallet.address.toB256()
    }

    protected generatePrivateKey(): string {
        return Buffer.from(FuelSigner.generatePrivateKey()).toString('hex');
    }

    async getSigner(): Promise<FuelSigner> {
        const privateKey = await this.getPrivateKey()
        return new FuelSigner(privateKey);
    }

    async signTransaction(transaction: object): Promise<string> {
        throw new Error('Not implemented');
    }

    protected getType(): WalletType {
        return "fuel";
    }
}