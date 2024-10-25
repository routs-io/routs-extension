import { defineStore } from 'pinia'
import { Wallet } from 'ethers'

import type { IStoredWallet, IWallet, IWalletsStore } from '@/types/wallets'

import { useStorageStore } from '@/stores/storage'

export const useWalletsStore = defineStore('wallets', {
  state: (): IWalletsStore => ({
    wallets: [],
    requestId: 0
  }),

  actions: {
    shortenAddress(address: string): string {
      // Example: 0x123456...123456
      return `${address.substring(0, 8)}...${address.substring(address.length - 6)}`
    },

    async parseWallets(privateKeys: string[]): Promise<IStoredWallet[]> {
      return privateKeys.map((pk) => ({
        privateKey: pk,
        address: new Wallet(pk).address,
        tags: []
      }));
    },

    async saveWallets(wallets: IStoredWallet[]) {
      const { get, set } = useStorageStore()

      const walletsInStorage: IStoredWallet[] = Array.from((await get('wallets')) ?? [])
      
      const uniquePrivateKeys = Array.from(new Set([...walletsInStorage.map(w => w.privateKey), ...wallets.map(w => w.privateKey)]))
      const uniqueWallets = uniquePrivateKeys.map(pk => ({
        privateKey: pk,
        address: new Wallet(pk).address,
        tags: walletsInStorage.find(w => w.privateKey === pk)?.tags ?? []
      }))

      await set(
        'wallets',
        uniqueWallets
      )
      await this.refreshWallets(0)
    },

    async handleConnection(wallet: IWallet, status?: boolean) {
      const { get, set } = useStorageStore()

      this.wallets[this.wallets.indexOf(wallet)].status = typeof status !== 'undefined'
        ? (status ? 'online' : 'offline') :
        (wallet.status === 'offline' ? 'online' : 'offline')

      const wallets: IWallet[] = (await get('connectedWallets')) ?? []
      const newWallets = wallets
        .map((w) => w.address.toLowerCase())
        .includes(wallet.address.toLowerCase())
        ? wallets.filter((w) => w.address.toLowerCase() !== wallet.address.toLowerCase())
        : [...wallets, wallet]
      await set('connectedWallets', newWallets)
    },

    async connectAll() {
      const { set } = useStorageStore()

      this.wallets.forEach(wallet => wallet.status = 'online')

      await set('connectedWallets', Array.from(this.wallets))
    },

    async disconnectAll() {
      const { set } = useStorageStore()

      this.wallets.forEach(wallet => wallet.status = 'offline')

      await set('connectedWallets', [])
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

    async sendWalletsToPage(useChecked: boolean = false) {
      const { set } = useStorageStore()

      if (useChecked) {
        this.wallets = await Promise.all(this.wallets.map(async (wallet) => {
          if (wallet.status === 'online') return wallet;
          await this.handleConnection(wallet, wallet.checked)
          return wallet;
        }))
      }

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
