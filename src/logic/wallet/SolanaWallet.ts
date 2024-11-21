import type { WalletType } from "@/types/wallets";
import Wallet from "./Wallet";
import { Keypair as SolanaSigner } from "@solana/web3.js";
import * as bs58 from "bs58";

export class SolanaWallet extends Wallet {
    protected generateAddress(privateKey: string): string {
        const sWallet = SolanaSigner.fromSecretKey(
            bs58.decode(
                privateKey,
            ),
          );
        console.log('sWallet', sWallet);
        return sWallet.publicKey.toString();
    }

    protected generatePrivateKey(): string {
        return bs58.encode(SolanaSigner.generate().secretKey);
    }

    async getSigner(): Promise<SolanaSigner> {
        const privateKey = await this.getPrivateKey()
        return SolanaSigner.fromSecretKey(
            bs58.decode(
                privateKey,
            ),
          );
    }

    async signTransaction(transaction: object): Promise<string> {
        throw new Error('Not implemented');
    }

    protected getType(): WalletType {
        return "sol";
    }
}