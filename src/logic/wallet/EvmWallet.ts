import type { WalletType } from "@/types/wallets";
import Wallet from "./Wallet";
import { Wallet as EvmSigner } from "ethers";
import type { IEvmTransaction } from "@/types/sign";

export class EvmWallet extends Wallet {
    protected generateAddress(privateKey: string): string {
        const eWallet = new EvmSigner(privateKey);
        return eWallet.address;
    }

    protected generatePrivateKey(): string {
        return EvmSigner.createRandom().privateKey;
    }

    async getSigner(): Promise<EvmSigner> {
        const privateKey = await this.getPrivateKey()
        return new EvmSigner(privateKey);
    }

    async signTransaction(transaction: IEvmTransaction): Promise<string> {
        const { from, to, data } = transaction

        if (!from || !to || !data) throw new Error('Invalid transaction data')

        const signer = await this.getSigner();

        const signedTransaction = await signer.signTransaction(transaction)
        return signedTransaction
    }

    protected getType(): WalletType {
        return "evm";
    }
}