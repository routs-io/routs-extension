import type { WalletType } from "@/types/wallets";
import Wallet from "./Wallet";
import { createKeyPairSignerFromPrivateKeyBytes, type KeyPairSigner, signTransaction, getBase64Encoder, getBase64Decoder, getTransactionDecoder, getTransactionEncoder,  getBase58Codec } from "@solana/web3.js";
import type { ISolTransaction } from "@/types/sign";

export class SolanaWallet extends Wallet {
    protected async generateAddress(privateKey: string): Promise<string> {
        console.log(privateKey);
        const sWallet = await createKeyPairSignerFromPrivateKeyBytes(
            getBase58Codec().encode(
                privateKey,
            ).slice(0, 32),
        );
        
        console.log(sWallet);
        return sWallet.address;
    }

    protected generatePrivateKey(): string {
        const bytes = new Uint8Array(8);

        return getBase58Codec().decode(window.crypto.getRandomValues(bytes));
    }

    async getSigner(): Promise<KeyPairSigner> {
        const privateKey = await this.getPrivateKey()
        return await createKeyPairSignerFromPrivateKeyBytes(
            getBase58Codec().encode(
                privateKey,
            ).slice(0, 32),
        );
    }

    async signTransaction(transaction: ISolTransaction): Promise<string> {
        const signer = await this.getSigner();

        const base64Encoder = getBase64Encoder();
        const base64Decoder = getBase64Decoder();
        const txDecoder = getTransactionDecoder();
        const txEncoder = getTransactionEncoder();

        const decodedTransaction = txDecoder.decode(base64Encoder.encode(transaction.data));
        
        const signedTransaction = await signTransaction([signer.keyPair], decodedTransaction);

        return base64Decoder.decode(txEncoder.encode(signedTransaction));
    }

    protected getType(): WalletType {
        return "sol";
    }
}