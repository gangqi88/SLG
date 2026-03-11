// Extend Window interface to support UniSat wallet
declare global {
  interface Window {
    unisat: any;
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
    if (!this.isUniSatInstalled()) {
      alert('Please install UniSat Wallet!');
      return null;
    }

    try {
      const accounts = await window.unisat.requestAccounts();
      const publicKey = await window.unisat.getPublicKey();

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
    if (!this.isUniSatInstalled()) return null;

    try {
      const signature = await window.unisat.signMessage(message);
      return signature;
    } catch (e) {
      console.error('Signing failed:', e);
      return null;
    }
  }

  // Verification usually happens on backend, but we can simulate or use a library if needed.
  // For frontend simulation, we just assume if signMessage succeeds, it's valid.
}
