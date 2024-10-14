import type { ISignStore, ITransaction } from "@/types/sign";
import { defineStore } from "pinia"
import { useStorageStore } from "./storage";
import { Wallet } from "ethers";

export const useSignStore = defineStore('sign', {
    state: (): ISignStore => ({
        currentStep: 0
    }),
    actions: {
        async signTransaction(transaction: ITransaction): Promise<string> {
            if(!transaction.from || !transaction.to || !transaction.data) {
                throw new Error("Invalid transaction data")
            }
            const { get } = useStorageStore();
            const wallets: { address: string, privateKey: string }[] = await get('wallets') ?? [];
            const wallet = wallets.filter(w => w.address.toLowerCase() === transaction.from?.toString().toLowerCase())[0];
            if(!wallet) {
                throw new Error("Wallet not imported")
            }

            const signer = new Wallet(wallet.privateKey);
            const signedTransaction = await signer.signTransaction(transaction);
            return signedTransaction;
        }
    }
});