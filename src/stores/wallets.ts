import { defineStore } from 'pinia'
import { Wallet as EthersWallet } from 'ethers'
import { Signer as FuelWallet } from '@fuel-ts/signer'

import type {
  IStoredWallet,
  IWallet,
  IWalletsStore,
  TypeTagColor,
  WalletType
} from '@/types/wallets'

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
        address: new EthersWallet(pk).address,
        tags: [],
        type: this.detectWalletType(new EthersWallet(pk).address)
      }))
    },

    detectWalletType(address: string): WalletType {
      if (/^0x[a-fA-F0-9]{40}$/g.test(address)) return 'evm'
      else if (/^0x[a-fA-F0-9]{64}$/g.test(address)) return 'fuel'
      else if (/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/g.test(address)) return 'btc'
      else if (/X[1-9A-HJ-NP-Za-km-z]{33}$/g.test(address)) return 'dash'
      else return 'unknown'
    },

    async sendMessage(method: string, data: unknown) {
      await chrome.runtime.sendMessage({
        id: this.requestId,
        method,
        data,
        direction: 'out'
      })
    },

    async saveWallets(wallets: IStoredWallet[]) {
      const { get, set } = useStorageStore()

      if (!wallets.length) {
        if (this.requestId) {
          await this.sendMessage('fuel_generateAccounts', [
            this.wallets.filter((w) => w.type === 'fuel').map((w) => w.address)
          ])
          this.requestId = 0
        }
        await this.refreshWallets(0)
        return
      }

      const walletsInStorage: IStoredWallet[] = Array.from((await get('wallets')) ?? [])

      const uniqueAddresses = Array.from(
        new Set([
          ...walletsInStorage.map((w) => w.address.toLowerCase()),
          ...wallets.map((w) => w.address.toLowerCase())
        ])
      )
      const uniqueWallets = uniqueAddresses.map((address) => ({
        privateKey:
          walletsInStorage.find((w) => w.address.toLowerCase() === address)?.privateKey ??
          wallets.find((w) => w.address.toLowerCase() === address)?.privateKey,
        address:
          walletsInStorage.find((w) => w.address.toLowerCase() === address)?.address ??
          wallets.find((w) => w.address.toLowerCase() === address)?.address,
        tags: Array.from(
          walletsInStorage.find((w) => w.address.toLowerCase() === address)?.tags ??
            wallets.find((w) => w.address.toLowerCase() === address)?.tags ??
            []
        ),
        type: this.detectWalletType(address)
      }))

      console.log('uniqueWallets', uniqueWallets)

      console.log(this.wallets)

      await set('wallets', uniqueWallets)
      if (this.requestId) {
        await this.sendMessage(
          'fuel_generateAccounts',
          wallets.map((w) => w.address)
        )
        this.requestId = 0
      }
      await this.refreshWallets(0)
    },

    async handleConnection(wallet: IWallet, status?: boolean) {
      const { get, set } = useStorageStore()

      this.wallets[this.wallets.indexOf(wallet)].status =
        typeof status !== 'undefined'
          ? status
            ? 'online'
            : 'offline'
          : wallet.status === 'offline'
            ? 'online'
            : 'offline'

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

      this.wallets
        .filter(({ type }) => type === 'evm')
        .forEach((wallet) => (wallet.status = 'online'))

      await set('connectedWallets', Array.from(this.wallets))
    },

    async disconnectAll() {
      const { set } = useStorageStore()

      this.wallets.forEach((wallet) => (wallet.status = 'offline'))

      await set('connectedWallets', [])
    },

    async getSignerByAddress(address: string): Promise<EthersWallet> {
      const { get } = useStorageStore()
      const wallets: IStoredWallet[] = await get('wallets')
      const wallet = wallets.find((w) => w.address.toLowerCase() === address.toLowerCase())
      if (!wallet) {
        throw new Error('Wallet not found')
      }
      return new EthersWallet(wallet.privateKey)
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
        type: w.type ?? 'evm',
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
        this.wallets = await Promise.all(
          this.wallets.map(async (wallet) => {
            if (wallet.status === 'online') return wallet
            await this.handleConnection(wallet, wallet.checked)
            return wallet
          })
        )
      }

      await set('connectedWallets', Array.from(this.wallets.filter((w) => w.status === 'online')))

      await this.sendMessage(
        'eth_requestAccounts',
        this.wallets.filter((w) => w.status === 'online').map((w) => w.address)
      )
    },

    generateFuelWallet(privateKey: string) {
      const wallet = new FuelWallet(privateKey)
      console.log('fuel wallet', wallet)
      return wallet.address.toB256()
    },

    async generateFuelWallets(addresses: string[]) {
      console.log('addresses', addresses)
      const { get } = useStorageStore()
      const walletsInStorage: IStoredWallet[] = (await get('wallets')) ?? []

      const wallets = walletsInStorage.filter((w) =>
        addresses.map((a) => a.toLowerCase()).includes(w.address.toLowerCase())
      )

      if (wallets.length === 0) {
        return []
      }

      console.log('wallets', wallets)

      const newWallets = wallets.map((w) => {
        const wallet = this.generateFuelWallet(w.privateKey)
        console.log('fuel address', wallet)
        return {
          address: wallet.slice(0, 2) !== '0x' ? `0x${wallet}` : wallet,
          tags: [
            {
              id: 1,
              name: `${w.address.slice(0, 6)}...${w.address.slice(-4)}`,
              color: 'green' as TypeTagColor
            }
          ],
          privateKey: w.privateKey,
          type: 'fuel' as WalletType
        }
      })
      return newWallets
    },

    async exportToCSV(wallets: IWallet[]) {
      const { get } = useStorageStore()

      const walletsInStorage: IStoredWallet[] = await get('wallets')

      const csvLines = walletsInStorage
        .filter((w) =>
          wallets.map((wallet) => wallet.address.toLowerCase()).includes(w.address.toLowerCase())
        )
        .map((w) => `${w.address},${w.privateKey}\n`)
      const valueBlob = new Blob(['Address,PrivateKey\n', ...csvLines], {
        type: 'text/csv;encoding:utf-8'
      })
      const blobURL = URL.createObjectURL(valueBlob)

      await chrome.runtime.sendMessage({ type: 'exportToCSV', data: { blobURL } })
    }
  }
})
