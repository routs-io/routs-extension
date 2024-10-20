import { type TransactionRequest } from 'ethers';

export interface ITransaction extends TransactionRequest {
    kind: string,
    platform: string
}

export interface IPathStep {
    activity: string,
    service: string,
    transactions: ITransaction[]
}

export interface ISignedPathStep {
    id: number,
    activity: string,
    service: string,
    transactions: (ITransaction & { signedHash: string })[]
}

export interface ISignStore {
    requestId: number,
    currentStep: number,
    path: IPathStep[],
    signedPath: ISignedPathStep[]
}