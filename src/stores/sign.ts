import type { IPathStep, ISignedPathStep, ISignStore, ITransaction } from "@/types/sign";
import { defineStore } from "pinia"
import { useStorageStore } from "./storage";
import { Wallet } from "ethers";

export const useSignStore = defineStore('sign', {
    state: (): ISignStore => ({
        requestId: 0,
        currentStep: 0,
        path: [],
        signedPath: []
    }),
    actions: {
        generateId(): number {
            return Math.floor(Math.random() * 1000000);
        },

        async signTransaction(transaction: ITransaction): Promise<string> {
            if (!transaction.from || !transaction.to || !transaction.data) {
                throw new Error("Invalid transaction data")
            }
            const { get } = useStorageStore();
            const wallets: { address: string, privateKey: string }[] = await get('wallets') ?? [];
            console.log(wallets);
            const wallet = wallets.filter(w => w.address.toLowerCase() === transaction.from?.toString().toLowerCase())[0];
            if (!wallet) {
                throw new Error("Wallet not imported")
            }

            const signer = new Wallet(wallet.privateKey);
            const signedTransaction = await signer.signTransaction(transaction);
            return signedTransaction;
        },

        setTransactions(requestId: number, path: IPathStep[]) {
            this.requestId = requestId;
            this.path = path;
        },

        addSignedStepToPath(step: ISignedPathStep) {
            const index = this.signedPath.map(p => p.id).indexOf(step.id)
            if (index === -1) {
                this.signedPath.push(step)
            }
            else {
                this.signedPath[index].transactions.push(...step.transactions)
            }
            this.currentStep++;
            if (this.currentStep >= this.path.map(p => p.transactions.length).reduce((a, b) => a + b, 0)) {
                this.sendTransactionToPage();
            }
        },

        async sendTransactionToPage() {
            await chrome.runtime.sendMessage({ id: this.requestId, method: 'eth_signTransactions', data: this.signedPath, direction: 'out' });
        }
    }
});