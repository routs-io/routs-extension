import { type TransactionRequest } from 'ethers'

export interface ITransaction extends TransactionRequest {
    kind: string
    platform: string
    signedHash?: string
}

export interface IPathStep {
    id: number;
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
