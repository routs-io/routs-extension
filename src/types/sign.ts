import { type TransactionRequest } from 'ethers';

export interface ITransaction extends TransactionRequest {
    kind: string,
    platform: string
}

export interface ISignStore {
    currentStep: number
}