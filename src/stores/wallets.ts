import { defineStore } from 'pinia'
import type { IStoredWallet, IWalletsStore, TypeTagColor, WalletType } from '@/types/wallets'

import { useStorageStore } from '@/stores/storage'
import { FuelWallet } from '@/logic/wallet/FuelWallet'
import type { IWallet } from '@/logic/wallet/types'
import { EvmWallet } from '@/logic/wallet/EvmWallet'
import { SolanaWallet } from '@/logic/wallet/SolanaWallet'

export const useWalletsStore = defineStore('wallets', {
  state: (): IWalletsStore => ({
    wallets: [],
    requestId: 0
  }),

  actions: {
    shortenAddress(address?: string | null): string {
      if (!address) return 'Unknown wallet address'
      return `${address.substring(0, 8)}...${address.substring(address.length - 6)}`
    },

    async parseWallets(privateKeys: string[]): Promise<IStoredWallet[]> {
      return await Promise.all(
        privateKeys.map(async (pk) => {
          const newWallet =
            this.detectPrivateKeyType(pk) === 'evm' ? new EvmWallet(pk) : new SolanaWallet(pk)

          await new Promise((resolve) => setTimeout(resolve, 10))

          return {
            privateKey: pk,
            address: newWallet.address,
            tags: [],
            type: newWallet.type
          }
        })
      )
    },

    detectAddressType(address: string): WalletType {
      if (/^0x[a-fA-F0-9]{40}$/g.test(address)) return 'evm'
      else if (/^0x[a-fA-F0-9]{64}$/g.test(address)) return 'fuel'
      else if (/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/g.test(address)) return 'btc'
      else if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/g.test(address)) return 'sol'
      else return 'unknown'
    },

    detectPrivateKeyType(privateKey: string): WalletType {
      if (/^(0x)?[0-9a-fA-F]{64}$/.test(privateKey)) return 'evm'
      else if (/^[0-9a-zA-Z]{87,88}$/.test(privateKey)) return 'sol'
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
          ...walletsInStorage.map((w) => w.address),
          ...wallets.map((w) => w.address)
        ])
      )
      const uniqueWallets = uniqueAddresses.map((address) => ({
        privateKey:
          walletsInStorage.find((w) => w.address === address)?.privateKey ??
          wallets.find((w) => w.address === address)?.privateKey,
        address:
          walletsInStorage.find((w) => w.address === address)?.address ??
          wallets.find((w) => w.address === address)?.address,
        tags: Array.from(
          walletsInStorage.find((w) => w.address === address)?.tags ??
          wallets.find((w) => w.address === address)?.tags ??
          []
        )
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

      const eventPayload = this.wallets.filter(w => !walletsInStorage.map(ww => ww.address.toLowerCase()).includes(w.address.toLowerCase())).map(w => w.format())
      if (eventPayload.length) await this.sendEvent('accountsAdded', eventPayload)
    },

    async deleteWallets(wallets: IWallet[]) {
      const { get, set } = useStorageStore()

      const walletsInStorage: IStoredWallet[] = Array.from((await get('wallets')) ?? [])

      const newWallets = walletsInStorage.filter(
        (w) => !wallets.map((ww) => ww.address.toLowerCase()).includes(w.address.toLowerCase())
      )

      await set('wallets', newWallets)
      const eventPayload = wallets.map(w => w.address)
      if (eventPayload.length) await this.sendEvent('accountsDeleted', eventPayload)
      await this.refreshWallets(0)
    },

    getWalletByAddress(address: string) {
      return this.wallets.find((w) => w.address.toLowerCase() === address.toLowerCase())
    },

    async refreshWallets(id: number) {
      this.requestId = id
      const { get } = useStorageStore()
      const wallets: IStoredWallet[] = (await get('wallets')) ?? []

      this.wallets = (
        await Promise.all(
          wallets.map(async (w) => {
            let wallet: IWallet
            w.type = this.detectAddressType(w.address);
            console.log('type', w.address, w.type)
            if (w.type === 'evm') {
              wallet = new EvmWallet(w.privateKey)
            } else if (w.type === 'fuel') {
              wallet = new FuelWallet(w.privateKey)
            } else if (w.type === 'sol') {
              wallet = new SolanaWallet(w.privateKey)
            } else {
              console.log('Unknown wallet type', w.type)
              return null
            }

            await new Promise((resolve) => setTimeout(resolve, 10))

            wallet.tags = w.tags ?? []
            return wallet
          })
        )
      ).filter((w) => w !== null)
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
        wallet.address =
          wallet.address.slice(0, 2) !== '0x' ? `0x${wallet.address}` : wallet.address
        wallet.tags = [
          {
            id: 1,
            name: `${w.address.slice(0, 6)}...${w.address.slice(-4)}`,
            color: 'green' as TypeTagColor
          }
        ]
        return {
          privateKey: w.privateKey,
          address: wallet.address,
          tags: wallet.tags,
          type: wallet.type
        }
      })
      return newWallets
    },

    async generateWallets(counts: { type: WalletType; count: number }[]): Promise<IStoredWallet[]> {
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
      })

      await new Promise((resolve) => setTimeout(resolve, 10))

      //console.log('event sent in generateWallets')
      //await this.sendEvent('accountsAdded', newWallets.map(w => w.format()))

      return await Promise.all(
        newWallets.map(async (w) => {
          return {
            privateKey: await w.getPrivateKey(),
            address: w.address,
            tags: w.tags,
            type: w.type
          }
        })
      )
    },

    async exportToCSV(wallets: IWallet[]) {
      const csvLines = await Promise.all(
        wallets.map(async (w) => `${w.address},${await w.getPrivateKey()}\n`)
      )

      const valueBlob = new Blob(['Address,PrivateKey\n', ...csvLines], {
        type: 'text/csv;encoding:utf-8'
      })
      const blobURL = URL.createObjectURL(valueBlob)

      await chrome.runtime.sendMessage({ type: 'exportToCSV', data: { blobURL } })
    }
  }
})
