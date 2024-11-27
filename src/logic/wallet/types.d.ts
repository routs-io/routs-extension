export interface IWallet {
    address: string;
    tags: ITag[];
    type: WalletType;
    status: WalletStatus;
    checked?: boolean;

    signTransaction(transaction: object): Promise<string>;

    getPrivateKey(): Promise<string>;

    format(): {
        address: string;
        tags: ITag[];
        type: WalletType;
    }
}