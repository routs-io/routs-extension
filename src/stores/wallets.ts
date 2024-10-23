import { defineStore } from 'pinia'
import { Wallet } from 'ethers'

import type { IWalletsStore } from '@/types/wallets'

import { useStorageStore } from '@/stores/storage'

export const useWalletsStore = defineStore('wallets', {
  state: (): IWalletsStore => ({
    wallets: [],
    checkedWallets: [],
    requestId: 0
  }),

  actions: {
    shortenAddress(address: string): string {
      // Example: 0x123456...123456
      return `${address.substring(0, 8)}...${address.substring(address.length - 6)}`
    },

    async saveWallets(privateKeys: string[]) {
      const { get, set } = useStorageStore()

      const walletsInStorage: { address: string; privateKey: string }[] =
        (await get('wallets')) ?? []

      console.log('saveWallets 1', walletsInStorage)
      console.log(
        'saveWallets 2',
        privateKeys.map((pk) => ({ address: new Wallet(pk).address, privateKey: pk }))
      )

      await set(
        'wallets',
        Array.from(
          new Set([
            ...walletsInStorage.map((w) => JSON.stringify(w)),
            ...privateKeys.map((pk) =>
              JSON.stringify({ address: new Wallet(pk).address, privateKey: pk })
            )
          ])
        ).map((w) => JSON.parse(w))
      )

      this.wallets = privateKeys.map((pk) => new Wallet(pk).address)
    },

    async getWalletByAddress(address: string): Promise<Wallet> {
      const { get } = useStorageStore()
      const wallets: { address: string; privateKey: string }[] = await get('wallets')
      const wallet = wallets.find((w) => w.address === address)
      if (!wallet) {
        throw new Error('Wallet not found')
      }
      return new Wallet(wallet.privateKey)
    },

    async refreshWallets(id: number) {
      console.log('refreshWallets', id)
      this.requestId = id
      const { get } = useStorageStore()
      const wallets: { address: string; privateKey: string }[] = await get('wallets')
      this.wallets = wallets.map((w) => w.address)
    },

    async sendWalletsToPage() {
      const { set } = useStorageStore()

      await set('checkedWallets', Array.from(this.wallets))

      await chrome.runtime.sendMessage({
        id: this.requestId,
        method: 'eth_requestAccounts',
        data: this.checkedWallets,
        direction: 'out'
      })
    }
  }
})
