import { type TransactionRequest as EvmTransactionRequest } from 'ethers'

export type PLATFORMS = "evm" | "sol" | "fuel" | "unknown";

export interface IEvmTransaction extends EvmTransactionRequest {
    kind: string
    platform: PLATFORMS
    signedHash?: string | null
}

export interface ISolTransaction {
    kind: string
    platform: PLATFORMS
    data: string
    signedHash?: string | null
}

export type IPathStep = ServiceConfigInput & {
    id: string;
    address: string;
    transaction: IEvmTransaction | ISolTransaction
}

export type IIncomingPathStep = ServiceConfigInput & {
    address: string
    transactions: (IEvmTransaction | ISolTransaction)[]
}

export type IOutgoingPathStep = {
    index: number
    address: string
    type: string
    service: string
    network: string
    transactions: (IEvmTransaction | ISolTransaction)[]
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