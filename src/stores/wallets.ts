import { defineStore } from 'pinia'
import { Wallet as EthersWallet } from 'ethers'

import type {
  IStoredWallet,
  IWalletsStore,
  TypeTagColor,
  WalletType
} from '@/types/wallets'

import { useStorageStore } from '@/stores/storage'
import { FuelWallet } from '@/logic/wallet/FuelWallet'
import type { FormattedWallet, IWallet } from '@/logic/wallet/types'
import { EvmWallet } from '@/logic/wallet/EvmWallet'
import { SolanaWallet } from '@/logic/wallet/SolanaWallet'

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
      else if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/g.test(address)) return 'sol'
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

    async sendEvent(event: string, data: unknown) {
      await chrome.runtime.sendMessage({
        type: 'event',
        event,
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

      if (typeof status !== 'undefined') {
        this.wallets[this.wallets.map(w => w.address.toLowerCase()).indexOf(wallet.address.toLowerCase())].status = status ? 'online' : 'offline'
      }
      else {
        this.wallets[this.wallets.map(w => w.address.toLowerCase()).indexOf(wallet.address.toLowerCase())].status = wallet.status === 'offline' ? 'online' : 'offline'
      }

      const wallets: FormattedWallet[] = (await get('connectedWallets')) ?? []
      const newWallets = wallets
        .map((w) => w.address.toLowerCase())
        .includes(wallet.address.toLowerCase())
        ? wallets.filter((w) => w.address.toLowerCase() !== wallet.address.toLowerCase())
        : [...wallets, wallet.format()]

      await set('connectedWallets', newWallets)

      await this.sendEvent('accountsChanged', newWallets)
    },

    async connectAll() {
      const { set } = useStorageStore()

      this.wallets
        .filter(({ type }) => type === 'evm')
        .forEach((wallet) => (wallet.status = 'online'))

      await set('connectedWallets', Array.from(this.wallets.map(w => w.format())))
      await this.sendEvent('accountsChanged', Array.from(this.wallets.map(w => w.format())))
    },

    async disconnectAll() {
      const { set } = useStorageStore()

      this.wallets.forEach((wallet) => (wallet.status = 'offline'))

      await set('connectedWallets', [])
      await this.sendEvent('accountsChanged', [])
    },

    getWalletByAddress(address: string) {
      return this.wallets.find((w) => w.address.toLowerCase() === address.toLowerCase())
    },

    async refreshWallets(id: number) {
      this.requestId = id
      const { get } = useStorageStore()
      const wallets: IStoredWallet[] = await get('wallets')
      const connectedWallets: IWallet[] = (await get('connectedWallets')) ?? []

      this.wallets = wallets.map((w) => {
        let wallet: IWallet;
        w.type = this.detectWalletType(w.address)
        if (w.type === 'evm') {
          wallet = new EvmWallet(w.privateKey)
        } else if (w.type === 'fuel') {
          wallet = new FuelWallet(w.privateKey)
        } else if (w.type === 'sol') {
          wallet = new SolanaWallet(w.privateKey)
        }
        else {

          console.log('Unknown wallet type', w.type)
          return null
        }

        wallet.tags = w.tags ?? []
        wallet.status = connectedWallets
          .map((w) => w.address.toLowerCase())
          .includes(w.address.toLowerCase())
          ? 'online'
          : 'offline'
        return wallet
      }).filter(w => w !== null)
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

      await set('connectedWallets', Array.from(this.wallets.filter((w) => w.status === 'online').map(w => w.format())))

      await this.sendMessage(
        'eth_requestAccounts',
        this.wallets.filter((w) => w.status === 'online').map((w) => w.address)
      )
    },

    async generateFuelWalletsFromEvm(addresses: string[]): Promise<IStoredWallet[]> {
      const { get } = useStorageStore()
      const walletsInStorage: IStoredWallet[] = (await get('wallets')) ?? []

      const wallets = walletsInStorage.filter((w) =>
        addresses.map((a) => a.toLowerCase()).includes(w.address.toLowerCase())
      )

      if (wallets.length === 0) {
        return []
      }

      const newWallets = wallets.map((w) => {
        const wallet = new FuelWallet(w.privateKey)
        wallet.address = wallet.address.slice(0, 2) !== '0x' ? `0x${wallet.address}` : wallet.address;
        wallet.tags = [
          {
            id: 1,
            name: `${w.address.slice(0, 6)}...${w.address.slice(-4)}`,
            color: 'green' as TypeTagColor
          }
        ];
        return {
          privateKey: w.privateKey,
          address: wallet.address,
          tags: wallet.tags,
          type: wallet.type
        };
      })
      return newWallets
    },

    async generateWallets(counts: { type: WalletType, count: number }[]): Promise<IStoredWallet[]> {
      const newWallets: IWallet[] = []
      counts.forEach(async ({ count, type }) => {
        switch (type) {
          case 'evm':
            newWallets.push(...Array.from({ length: count }).map(() => new EvmWallet()))
            break
          case 'fuel':
            newWallets.push(...Array.from({ length: count }).map(() => new FuelWallet()))
            break
          case 'sol':
            newWallets.push(...Array.from({ length: count }).map(() => new SolanaWallet()))
            break
        }
      });

      return await Promise.all(newWallets.map(async (w) => {
        return {
          privateKey: await w.getPrivateKey(),
          address: w.address,
          tags: w.tags,
          type: w.type
        };
      }))
    },

    async exportToCSV(wallets: IWallet[]) {
      const csvLines = await Promise.all(wallets
        .map(async (w) => `${w.address},${await w.getPrivateKey()}\n`))

      const valueBlob = new Blob(['Address,PrivateKey\n', ...csvLines], {
        type: 'text/csv;encoding:utf-8'
      })
      const blobURL = URL.createObjectURL(valueBlob)

      await chrome.runtime.sendMessage({ type: 'exportToCSV', data: { blobURL } })
    }
  }
})
