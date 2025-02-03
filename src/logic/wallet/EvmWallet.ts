import type { WalletType } from "@/types/wallets";
import Wallet from "./Wallet";
import { Wallet as EvmSigner, Transaction } from "ethers";
import type { IEvmTransaction } from "@/types/sign";

export class EvmWallet extends Wallet {
    protected async generateAddress(privateKey: string): Promise<string> {
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

        const adjustedTx = {
            to: transaction.to as string,
            data: transaction.data,
            value: transaction.value,
            gasLimit: transaction.gasLimit,
            gasPrice: transaction.gasPrice,
            nonce: transaction.nonce,
            chainId: transaction.chainId,
            type: 0
        };

        const btx = Transaction.from(adjustedTx);

        const signedTransaction = await signer.signTransaction(btx)
        return signedTransaction
    }

    protected getType(): WalletType {
        return "evm";
    }
}