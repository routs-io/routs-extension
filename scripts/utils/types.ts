export interface MessageRequest {
    id: number,
    method: string,
    params: any[]
};

export interface SendMessageResponse {
    status: "success" | "fail",
    message?: string
}

export interface ISolSocketResponse {
    data: string,
    kind: string;
    chainId: string | null;
    platform: WalletType;
}

export interface IEvmSocketResponse {
    data: string,
    to: string | null;
    from: string | null;
    nonce: number | null;
    gasLimit: string | null;
    gasPrice: string | null;
    value?: string;
    chainId: string | null;
    kind: string;
    platform: WalletType;
}

export interface ISocketResponse {
    address: string,
    taskId: number,
    taskStepId: number,
    data: ISolSocketResponse | IEvmSocketResponse,
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

export type WalletType = 'evm' | 'sol' | 'fuel' | 'unknown'

export type WalletStatus = 'online' | 'offline'

export type TypeTagColor = 'red' | 'orange' | 'green' | 'cyan' | 'blue' | 'purple' | 'pink'
