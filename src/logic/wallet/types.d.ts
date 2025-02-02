export interface ITag {
    id: number
    name: string
    color: TypeTagColor
}

export interface IWallet {
    address: string;
    tags: ITag[];
    type: WalletType;
    checked?: boolean;

    signTransaction(transaction: object): Promise<string>;

    getPrivateKey(): Promise<string>;

    format(): FormattedWallet;
}

export type FormattedWallet = {
    address: string;
    tags: ITag[];
    type: WalletType;
}