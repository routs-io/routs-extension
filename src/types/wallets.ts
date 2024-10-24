export interface IWalletsStore {
  wallets: IWallet[]
  requestId: number
}

export interface IWallet {
  address: string
  tags: ITag[]
  status: 'online' | 'offline'
  checked?: boolean
}

export interface IStoredWallet {
  address: string
  privateKey: string
  tags: ITag[]
}

export interface ITag {
  id: number
  name: string
  color: TypeTagColor
}

export type TypeTagColor = 'red' | 'orange' | 'green' | 'cyan' | 'blue' | 'purple' | 'pink'
