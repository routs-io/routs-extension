export interface IWalletsStore {
  wallets: string[]
  checkedWallets: string[]
  requestId: number
}

export interface IWallet {
  address: string
  tags: ITag[]
  status: 'online' | 'offline'
}

export interface ITag {
  id: number
  name: string
  color: TypeTagColor
}

export type TypeTagColor = 'red' | 'orange' | 'green' | 'cyan' | 'blue' | 'purple' | 'pink'
