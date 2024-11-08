import { type TransactionRequest } from 'ethers'

export interface ITransaction extends TransactionRequest {
    kind: string
    platform: string
    signedHash?: string | null
}

export type IPathStep = ServiceConfigInput & {
    id: string;
    address: string;
    transaction: ITransaction
}

export type IIncomingPathStep = ServiceConfigInput & {
    address: string
    transactions: ITransaction[]
}

export type IOutgoingPathStep = {
    index: number
    address: string
    type: string
    service: string
    network: string
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

export type ServiceType = 'swap' | 'pool' | 'bridge_token' | 'bridge_tokens' | 'bridge_refuel' | 'bridge_nft' | 'mint' | 'dmail' | 'lending';

export type ServiceConfigParams = {
    service: string;
    network: string;
    type: ServiceType;
}

type AllParams = {
    amount?: number,
    isExactAmount?: boolean | null,
    direction?: 'supply' | 'withdraw' | null,
    networkFrom?: string,
    networkTo?: string,
    token?: string,
    tokenIn?: string,
    tokenOut?: string,
    slippage?: number | null,
    dstNativeAmount: number | null,
    nftTokenId?: string | null,
    repeat?: number | 1,
}

export declare type ServiceConfigInput = ServiceConfigParams & AllParams