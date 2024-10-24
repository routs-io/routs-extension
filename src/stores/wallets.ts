import { defineStore } from 'pinia'
import { Wallet } from 'ethers'

import type { IStoredWallet, IWallet, IWalletsStore } from '@/types/wallets'

import { useStorageStore } from '@/stores/storage'

export const useWalletsStore = defineStore('wallets', {
  state: (): IWalletsStore => ({
    // TODO: delete later
    wallets: [],
    requestId: 0
  }),

  actions: {
    shortenAddress(address: string): string {
      // Example: 0x123456...123456
      return `${address.substring(0, 8)}...${address.substring(address.length - 6)}`
    },

    async saveWallets(privateKeys: string[]) {
      const { get, set } = useStorageStore()

      const walletsInStorage: IStoredWallet[] = (await get('wallets')) ?? []

      await set(
        'wallets',
        Array.from(
          new Set([
            ...walletsInStorage.map((w) => JSON.stringify(w)),
            ...privateKeys.map((pk) =>
              JSON.stringify({ address: new Wallet(pk).address, privateKey: pk, tags: [] })
            )
          ])
        ).map((w) => JSON.parse(w))
      )
      this.wallets = privateKeys.map((pk) => ({
        address: new Wallet(pk).address,
        tags: [],
        status: 'offline'
      }))
    },

    async handleConnection(wallet: IWallet) {
      const { get, set } = useStorageStore()

      this.wallets[this.wallets.indexOf(wallet)].status =
        wallet.status === 'offline' ? 'online' : 'offline'
      const wallets: IWallet[] = (await get('connectedWallets')) ?? []
      const newWallets = wallets
        .map((w) => w.address.toLowerCase())
        .includes(wallet.address.toLowerCase())
        ? wallets.filter((w) => w.address.toLowerCase() !== wallet.address.toLowerCase())
        : [...wallets, wallet]
      await set('connectedWallets', newWallets)
    },

    async getSignerByAddress(address: string): Promise<Wallet> {
      const { get } = useStorageStore()
      const wallets: IStoredWallet[] = await get('wallets')
      const wallet = wallets.find((w) => w.address.toLowerCase() === address.toLowerCase())
      if (!wallet) {
        throw new Error('Wallet not found')
      }
      return new Wallet(wallet.privateKey)
    },

    async refreshWallets(id: number) {
      console.log('refreshWallets', id)
      this.requestId = id
      const { get } = useStorageStore()
      const wallets: IStoredWallet[] = await get('wallets')
      const connectedWallets: IWallet[] = (await get('connectedWallets')) ?? []

      console.log(wallets, connectedWallets)

      this.wallets = wallets.map((w) => ({
        address: w.address,
        tags: w.tags ?? [],
        status: connectedWallets
          .map((w) => w.address.toLowerCase())
          .includes(w.address.toLowerCase())
          ? 'online'
          : 'offline'
      }))
    },

    async sendWalletsToPage() {
      const { set } = useStorageStore()

      await set('connectedWallets', Array.from(this.wallets.filter((w) => w.status === 'online')))

      await chrome.runtime.sendMessage({
        id: this.requestId,
        method: 'eth_requestAccounts',
        data: this.wallets.filter((w) => w.status === 'online'),
        direction: 'out'
      })
    }
  }
})
