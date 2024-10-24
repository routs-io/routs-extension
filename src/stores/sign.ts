import type {
    IIncomingPathStep,
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
        generateId(index: number): string {
            return `${index}-${Math.floor(Math.random() * 1000000)}`
        },

        async signTransaction(transaction: ITransaction): Promise<string> {
            const { from, to, data } = transaction

            if (!from || !to || !data) throw new Error('Invalid transaction data')

            const { getSignerByAddress } = useWalletsStore();

            const signer = await getSignerByAddress(from.toString());
            const signedTransaction = await signer.signTransaction(transaction);
            return signedTransaction;
        },

        setTransactions(requestId: number, path: IIncomingPathStep[]) {
            this.requestId = requestId
            this.path = path.map((step, index) => {
                const id = this.generateId(index)
                return step.transactions.map((transaction) => {
                    return {
                        id,
                        address: step.address,
                        activity: step.activity,
                        service: step.service,
                        transaction: transaction
                    }
                })
            }).flat()

        },

        formatPathToIncoming(path: IPathStep[]): IIncomingPathStep[] {
            return Array.from(new Set(path.map((step) => {
                return JSON.stringify({
                    address: step.address,
                    activity: step.activity,
                    service: step.service,
                    transactions: path.filter(p => p.id.split('-')[0] === step.id.split('-')[0]).map(p => p.transaction)
                })
            }))).map(s => JSON.parse(s))
        },

        async signAll() {
            this.path = await Promise.all(this.path.map(async (step) => {
                if(typeof step.transaction.signedHash !== 'undefined') return step
                const signedHash = await this.signTransaction(step.transaction)
                step.transaction.signedHash = signedHash
                return step
            }))

            await this.sendTransactionsToPage()
        },

        async rejectAll() {
            this.path.forEach(step => {
                step.transaction.signedHash = null
            })
            await this.sendTransactionsToPage()
        },

        async sendTransactionsToPage() {
            await chrome.runtime.sendMessage({
                id: this.requestId,
                method: 'eth_signTransactions',
                data: this.formatPathToIncoming(this.path),
                direction: 'out'
            })
        }
    }
})
