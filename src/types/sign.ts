import { type TransactionRequest } from 'ethers'

export interface ITransaction extends TransactionRequest {
    kind: string
    platform: string
    signedHash?: string | null
}

export interface IPathStep {
    id: string;
    address: string
    activity: string
    service: string
    transaction: ITransaction
}

export interface IIncomingPathStep {
    address: string
    activity: string
    service: string
    transactions: ITransaction[]
}

export interface ISignStore {
    requestId: number
    currentStep: number
    path: IPathStep[]
}

export interface IPrivateKey {
    address: string
    privateKey: string
}
