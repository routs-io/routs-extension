import type {
    IIncomingPathStep,
    IOutgoingPathStep,
    IPathStep,
    ISignStore,
    IEvmTransaction,
} from '@/types/sign'
import { defineStore } from 'pinia'
import { useWalletsStore } from '@/stores/wallets'

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

        async signEvmTransaction(transaction: IEvmTransaction): Promise<string> {
            
            const { from, to, data } = transaction

            if (!from || !to || !data) throw new Error('Invalid transaction data')

            const { getWalletByAddress } = useWalletsStore()

            const signer = getWalletByAddress(from.toString())
            if(!signer) throw new Error('Wallet not found')
            const signedTransaction = await signer.signTransaction(transaction)
            return signedTransaction
        },

        setTransactions(requestId: number, path: IIncomingPathStep[]) {
            const { refreshWallets } = useWalletsStore()
            refreshWallets(0);
            this.requestId = requestId
            this.path = path.map((step, index) => {
                const id = this.generateId(index)
                return step.transactions.map((transaction) => {
                    return {
                        id,
                        address: step.address,
                        type: step.type,
                        service: step.service,
                        network: step.network,
                        networkFrom: step.networkFrom ?? step.network,
                        networkTo: step.networkTo ?? step.network,
                        tokenIn: step.tokenIn ?? step.token,
                        tokenOut: step.tokenOut ?? step.token,
                        amount: step.amount,
                        isExactAmount: step.isExactAmount ?? null,
                        slippage: step.slippage ?? null,
                        dstNativeAmount: step.dstNativeAmount ?? null,
                        repeat: step.repeat ?? 1,
                        direction: step.direction ?? null,
                        transaction: transaction
                    } as IPathStep
                })
            }).flat()

        },

        formatPathToIncoming(path: IPathStep[]): IOutgoingPathStep[] {
            return Array.from(new Set(path.map((step) => {
                return JSON.stringify({
                    index: step.id.split('-')[0],
                    address: step.address,
                    type: step.type,
                    service: step.service,
                    network: step.network,
                    transactions: path.filter(p => p.id.split('-')[0] === step.id.split('-')[0]).map(p => p.transaction)
                })
            })))
                .map(s => JSON.parse(s))
                .sort((a, b) => a.index - b.index)
                .map(step => ({
                    index: step.index,
                    address: step.address,
                    type: step.type,
                    service: step.service,
                    network: step.network,
                    transactions: step.transactions
                }))
        },

        async signAll() {
            this.path = await Promise.all(this.path.map(async (step) => {
                if (typeof step.transaction.signedHash !== 'undefined') return step
                const signedHash = await this.signEvmTransaction(step.transaction)
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
