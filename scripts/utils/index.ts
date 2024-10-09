import { localStorage } from './storage.js';
import { Wallet, type TransactionRequest } from "ethers";

async function signTransactionsWithWallet(transactions: TransactionRequest[]) {
    const wallets: { address: string, privateKey: string }[] = await getWallets();
    return Promise.all(transactions.map(async (transaction) => {
        const walletIndex = wallets.findIndex(w => w.address.toLowerCase() === transaction.from?.toString().toLowerCase());
        console.log('walletIndex', walletIndex);
        if (walletIndex === -1) {
            throw new Error('Wallet not found');
        }
        const signer = new Wallet(wallets[walletIndex].privateKey);
        const signedTransaction = await signer.signTransaction(transaction);
        return {
            hash: signedTransaction,
            tx: transaction
        }
    }));
}

export async function getWallets() {
    return (await localStorage.get('wallets')).map((w: { address: string, privateKey: string }) => w.address);
}

export async function signTransactions(transactions: TransactionRequest[]) {
    console.log('transactions', transactions);
    const signedTransactions = await signTransactionsWithWallet(transactions);
    console.log('signedTransactions', signedTransactions);
    return signedTransactions;
}