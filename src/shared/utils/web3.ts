interface UniSatProvider {
  requestAccounts: () => Promise<string[]>;
  getPublicKey: () => Promise<string>;
  signMessage: (message: string) => Promise<string>;
}

// Extend Window interface to support UniSat wallet
declare global {
  interface Window {
    unisat?: UniSatProvider;
  }
}

export interface WalletAccount {
  address: string;
  publicKey: string;
}

export class Web3Manager {
  static isUniSatInstalled(): boolean {
    return typeof window.unisat !== 'undefined';
  }

  static async connectWallet(): Promise<WalletAccount | null> {
    const unisat = window.unisat;

    if (!unisat) {
      return null;
    }

    try {
      const accounts = await unisat.requestAccounts();
      const publicKey = await unisat.getPublicKey();

      if (accounts && accounts.length > 0) {
        return {
          address: accounts[0],
          publicKey: publicKey,
        };
      }
    } catch (e) {
      console.error('Wallet connection failed:', e);
    }
    return null;
  }

  static async signMessage(message: string): Promise<string | null> {
    const unisat = window.unisat;

    if (!unisat) return null;

    try {
      const signature = await unisat.signMessage(message);
      return signature;
    } catch (e) {
      console.error('Signing failed:', e);
      return null;
    }
  }

  // Verification usually happens on backend, but we can simulate or use a library if needed.
  // For frontend simulation, we just assume if signMessage succeeds, it's valid.
}
