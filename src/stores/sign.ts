import type {
    IPathStep,
    ISignStore,
    ITransaction,
} from '@/types/sign'
import { defineStore } from 'pinia'
import { useWalletsStore } from "@/stores/wallets";

export const useSignStore = defineStore('sign', {
    state: (): ISignStore => ({
        requestId: 0,
        currentStep: 0,
        path: []
    }),

    actions: {
        generateId(): number {
            return Math.floor(Math.random() * 1000000)
        },

        async signTransaction(transaction: ITransaction): Promise<string> {
            const { from, to, data } = transaction

            if (!from || !to || !data) throw new Error('Invalid transaction data')

            const { getSignerByAddress } = useWalletsStore();

            const signer = await getSignerByAddress(from.toString());
            const signedTransaction = await signer.signTransaction(transaction);
            return signedTransaction;
        },

        setTransactions(requestId: number, path: IPathStep[]) {
            this.requestId = requestId
            this.path = path.map(p => { p.id = this.generateId(); return p; })
        },

        addSignedStepToPath(step: IPathStep) {
            //   const index = this.signedPath.map((p) => p.id).indexOf(step.id)
            //   if (index === -1) {
            //     this.signedPath.push(step)
            //   } else {
            //     this.signedPath[index].transactions.push(...step.transactions)
            //   }
            //   this.currentStep++
            //   if (
            //     this.currentStep >= this.path.map((p) => p.transactions.length).reduce((a, b) => a + b, 0)
            //   ) {
            //     this.sendTransactionToPage()
            //   }

            const stepIndex = this.path.findIndex(({ id }) => id === step.id)

            stepIndex === -1
                ? this.path.push(step)
                : !this.path[stepIndex].transactions
                    ? this.path[stepIndex].transactions = step.transactions
                    : this.path[stepIndex].transactions.push(...step.transactions)

            this.currentStep++

            const totalTransactions = this.path.reduce(
                (total, path) => total + path.transactions.length,
                0
            )

            if (this.currentStep >= totalTransactions) this.sendTransactionToPage()
        },

        async sendTransactionToPage() {
            await chrome.runtime.sendMessage({
                id: this.requestId,
                method: 'eth_signTransactions',
                data: this.path,
                direction: 'out'
            })
        }
    }
})
