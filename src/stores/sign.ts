import type {
  IPathStep,
  ISignedPathStep,
  ISignStore,
  ITransaction,
  IPrivateKey
} from '@/types/sign'
import { defineStore } from 'pinia'
import { useStorageStore } from '@/stores/storage'
import { Wallet } from 'ethers'

export const useSignStore = defineStore('sign', {
  state: (): ISignStore => ({
    requestId: 0,
    currentStep: 0,
    path: [],
    signedPath: []
  }),

  actions: {
    generateId(): number {
      return Math.floor(Math.random() * 1000000)
    },

    async signTransaction(transaction: ITransaction): Promise<string> {
      const { from, to, data } = transaction

      if (!from || !to || !data) throw new Error('Invalid transaction data')

      const { get } = useStorageStore()
      const wallets = (await get<IPrivateKey[]>('wallets')) ?? []

      console.log(wallets)

      const wallet = wallets.find(({ address }) => address.toLowerCase() === from.toLowerCase())

      if (!wallet) throw new Error('Wallet not imported')

      const signer = new Wallet(wallet.privateKey)
      const signedTransaction = await signer.signTransaction(transaction)

      return signedTransaction
    },

    setTransactions(requestId: number, path: IPathStep[]) {
      this.requestId = requestId
      this.path = path
    },

    addSignedStepToPath(step: ISignedPathStep) {
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

      const stepIndex = this.signedPath.findIndex(({ id }) => id === step.id)

      stepIndex === -1
        ? this.signedPath.push(step)
        : this.signedPath[stepIndex].transactions.push(...step.transactions)

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
        data: this.signedPath,
        direction: 'out'
      })
    }
  }
})
