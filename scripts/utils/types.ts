export interface MessageRequest {
    id: number,
    method: string,
    params: any[]
};

export interface SendMessageResponse {
    status: "success" | "fail",
    message?: string
}

export interface ISocketResponse {
    address: string,
    taskId: number,
    taskStepId: number,
    data: string,
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

export interface ITag {
    id: number
    name: string
    color: TypeTagColor
}

export type WalletType = 'evm' | 'fuel' | 'btc' | 'dash' | 'unknown'

export type WalletStatus = 'online' | 'offline'

export type TypeTagColor = 'red' | 'orange' | 'green' | 'cyan' | 'blue' | 'purple' | 'pink'
