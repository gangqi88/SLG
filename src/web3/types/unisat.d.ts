// UniSat 钱包全局类型定义

export interface UniSatWallet {
    // 账户相关
    requestAccounts(): Promise<string[]>;
    getAccounts(): Promise<string[]>;

    // 网络相关
    getNetwork(): Promise<string>;
    switchNetwork(network: 'fractal_mainnet' | 'fractal_testnet' | string): Promise<void>;

    // 余额相关
    getBalance(): Promise<{
        confirmed: number;
        unconfirmed: number;
        total: number;
    }>;

    // 地址相关
    getPublicKey(): Promise<string>;

    // 签名相关
    signMessage(message: string, type?: 'bip322-simple' | 'ecdsa'): Promise<string>;
    signPsbt(psbtHex: string, options?: SignPsbtOptions): Promise<string>;
    pushPsbt(psbtHex: string): Promise<string>;

    // 交易相关
    sendBitcoin(
        toAddress: string,
        satoshis: number,
        options?: {
            feeRate?: number;
            memo?: string;
        }
    ): Promise<string>;

    pushTx(rawTx: string): Promise<string>;

    // 铭刻相关
    inscribe(
        content: string,
        options?: {
            contentType?: string;
            feeRate?: number;
        }
    ): Promise<{
        inscriptionId: string;
        txid: string;
    }>;

    // 事件监听
    on(event: 'accountsChanged', callback: (accounts: string[]) => void): void;
    on(event: 'networkChanged', callback: (network: string) => void): void;

    removeListener(event: string, callback: Function): void;
}

export interface SignPsbtOptions {
    autoFinalized?: boolean;
    toSignInputs: {
        index: number;
        address?: string;
        publicKey?: string;
        sighashTypes?: number[];
    }[];
}

export interface BRC20Balance {
    ticker: string;
    overallBalance: string;
    transferableBalance: string;
    availableBalance: string;
    decimals: number;
}

export interface Inscription {
    inscriptionId: string;
    inscriptionNumber: number;
    contentType: string;
    contentLength: number;
    address?: string;
    timestamp?: number;
}

export interface InscriptionResult {
    inscriptionId?: string;
    txid?: string;
    error?: string;
}

export interface NFTHeroInscription {
    inscriptionId: string;
    inscriptionNumber: number;
    address: string;
    contentType: string;
    contentLength: number;
    timestamp: number;
    genesisAddress?: string;
    outputValue?: number;
}

export interface InscriptionContent {
    protocol?: string;
    p?: string;
    tick?: string;
    op?: string;
    [key: string]: string | number | undefined;
}

export interface MintNFTResult {
    success: boolean;
    inscriptionId?: string;
    txid?: string;
    error?: string;
    fee?: number;
}

export interface NFTTransferResult {
    success: boolean;
    txid?: string;
    error?: string;
}

export interface InscriptionUTXO {
    inscriptionId: string;
    inscriptionNumber: number;
    address: string;
    outputValue: number;
    satoshi: number;
    contentType: string;
    contentLength: number;
    timestamp: number;
}

export declare global {
    interface Window {
        unisat?: UniSatWallet;
    }
}

export {};
