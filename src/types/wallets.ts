export interface IWalletsStore {
  wallets: IWallet[]
  requestId: number
}

export interface IWallet {
  address: string
  tags: ITag[]
  status: WalletStatus
  type: WalletType
  checked?: boolean
}

export interface IStoredWallet {
  address: string
  privateKey: string
  tags: ITag[]
  type: WalletType
}

export interface IGeneratedWallet {
  icon: string
  name: string
  amount: number
}

export interface ITag {
  id: number
  name: string
  color: TypeTagColor
}

export type WalletType = 'evm' | 'fuel' | 'btc' | 'dash' | 'unknown'

export type WalletStatus = 'online' | 'offline'

export type TypeTagColor = 'red' | 'orange' | 'green' | 'cyan' | 'blue' | 'purple' | 'pink'
