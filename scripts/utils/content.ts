import { createKeyPairSignerFromPrivateKeyBytes, getBase58Codec, signTransaction, getBase64Codec, getTransactionCodec } from './packages/@solana/web3.js';
import { Wallet as EvmSigner, Transaction } from './packages/ethers.js';
import { localStorage } from "./storage.js"
import type { IEvmSocketResponse, ISocketResponse, ISolSocketResponse, IStoredWallet, IWallet } from "./types.js";
import { install } from './packages/@solana/webcrypto-ed25519-polyfill.js';
import { SOCKET_URL } from './constants.js';

export const ContentMethods = {
    ping: async () => {
        return { message: "Success" }
    },

    eth_accounts: async () => {
        const { get } = localStorage;
        const wallets: IWallet[] = await get('wallets') ?? [];

        return wallets.map(w => ({
            address: w.address,
            type: w.type,
            tags: w.tags
        })).filter(w => w.type !== 'unknown');
    },

    delete_accounts: async (addresses: string[]) => {
        const { get, set } = localStorage;
        const wallets: IWallet[] = await get('wallets') ?? [];

        console.log(addresses)
        console.log(wallets)

        const newWallets = wallets.filter(w => !addresses.map(a => a.toLowerCase()).includes(w.address.toLowerCase()))

        console.log(newWallets)

        await set('wallets', newWallets)
    },

    fuel_accounts: async (evmFilterAddresses?: string[]) => {
        const { get } = localStorage;
        const fuel: IStoredWallet[] = await get('wallets') ?? [];

        return fuel
            .filter(w => w.type === 'fuel' && (!evmFilterAddresses || evmFilterAddresses
                .map(a => `${a.slice(0, 6)}...${a.slice(-4)}`.toLowerCase())
                .includes(w.tags[0].name.toLowerCase())))
            .map(w => evmFilterAddresses ? {
                address: w.address, index: evmFilterAddresses
                    .map(a => `${a.slice(0, 6)}...${a.slice(-4)}`.toLowerCase())
                    .indexOf(w.tags[0].name.toLowerCase())
            } : w.address);
    },

    ws_setupTask: async (taskId: number, accessToken: string) => {
        try {
            install();
        } catch (e) {
            console.log(e);
        }
        const { get } = localStorage;
        const wallets: IStoredWallet[] = await get('wallets') ?? [];

        console.log(taskId, accessToken, wallets)

        const socket = new WebSocket(
            `${SOCKET_URL}/ws?action=transaction_sign&taskId=${taskId}&auth=${encodeURIComponent(accessToken)}`
        )

        socket.addEventListener("open", (e) => {
            console.log(e.type)
            console.log("WebSocket open")
        })

        setInterval(() => {
            socket.send(JSON.stringify({
                taskId,
                ping: true
            }))
        }, 5000)

        socket.addEventListener("message", async (event) => {
            // TODO: delete later
            console.log("message data:", JSON.parse(event.data))
            console.log("----------------------")

            const socketData: ISocketResponse = JSON.parse(event.data)
            if (socketData && socketData.data) {
                const wallet = wallets.find((w) => w.address.toLowerCase() === socketData.address.toLowerCase())
                if (!wallet) throw new Error('Wallet not found')

                let signedHash: string;
                if (socketData.data.platform === 'sol') {
                    const tx = socketData.data as ISolSocketResponse;
                    const signer = await createKeyPairSignerFromPrivateKeyBytes(
                        getBase58Codec().encode(
                            wallet.privateKey,
                        ).slice(0, 32),
                    );

                    const base64Codec = getBase64Codec();
                    const txCodec = getTransactionCodec();

                    const decodedTransaction = txCodec.decode(base64Codec.encode(tx.data));

                    const signedTransaction = await signTransaction([signer.keyPair], decodedTransaction);

                    signedHash = base64Codec.decode(txCodec.encode(signedTransaction));

                    console.log('in signSolTransaction', signedHash);
                }
                else if (socketData.data.platform === 'evm') {
                    const tx = socketData.data as IEvmSocketResponse;
                    const signer = new EvmSigner(wallet.privateKey);

                    const { from, to, data, chainId } = tx

                    if (!from || !to || !data || !chainId) throw new Error('Invalid transaction data')

                    const adjustedTx = {
                        to: tx.to as string,
                        data: tx.data,
                        value: tx.value,
                        gasLimit: tx.gasLimit,
                        gasPrice: tx.gasPrice,
                        nonce: tx.nonce,
                        chainId: tx.chainId,
                        type: 0
                    };

                    console.log(adjustedTx);

                    const btx = Transaction.from(adjustedTx);

                    console.log(btx);

                    signedHash = await signer.signTransaction(btx)
                }
                else {
                    //socket.close();
                    return;
                }
                socket.send(JSON.stringify({
                    taskId,
                    taskStepId: socketData.taskStepId,
                    address: socketData.address,
                    data: socketData.data,
                    signedHash
                }))
            }
            else {
                //socket.close();
                return;
            }
        })

        socket.addEventListener("close", () => {
            console.log("WebSocket close")
        })

        socket.addEventListener("error", (event) => {
            console.error("WebSocket error:", event)
        })
    }
}