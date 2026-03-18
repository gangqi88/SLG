import React, { useState } from 'react';
import { Web3Manager, WalletAccount } from '@/shared/utils/web3';
import { useModal } from '@/shared/components/ModalProvider';

interface WalletConnectProps {
  onConnect: (account: WalletAccount) => void;
  onDisconnect: () => void;
}

const WalletConnect: React.FC<WalletConnectProps> = ({ onConnect, onDisconnect }) => {
  const modal = useModal();
  const [account, setAccount] = useState<WalletAccount | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    if (!Web3Manager.isUniSatInstalled()) {
      modal.openAlert({
        title: '未安装钱包',
        message: '未检测到 UniSat Wallet，请先安装后再连接。',
      });
      return;
    }

    setIsConnecting(true);
    setError(null);
    try {
      const acc = await Web3Manager.connectWallet();
      if (acc) {
        setAccount(acc);
        onConnect(acc);
      } else {
        setError('Connection failed or rejected.');
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Connection error');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setAccount(null);
    onDisconnect();
  };

  const signTest = async () => {
    if (account) {
      const sig = await Web3Manager.signMessage('Hello Civilization Spark!');
      if (sig) {
        modal.openAlert({
          title: '签名成功',
          message: `Sig: ${sig.slice(0, 20)}...`,
        });
      }
    }
  };

  return (
    <div
      style={{
        padding: '10px',
        backgroundColor: '#333',
        borderRadius: '8px',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
      }}
    >
      {account ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.9em', color: '#8c8' }}>
            Connected: {account.address.slice(0, 6)}...{account.address.slice(-4)}
          </span>
          <button onClick={signTest} style={{ padding: '5px 10px', fontSize: '0.8em' }}>
            Sign Test
          </button>
          <button
            onClick={handleDisconnect}
            style={{ padding: '5px 10px', fontSize: '0.8em', backgroundColor: '#d32f2f' }}
          >
            Disconnect
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f57c00',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {isConnecting ? 'Connecting...' : 'Connect UniSat Wallet'}
          </button>
          {error && <span style={{ color: '#ff5252', fontSize: '0.8em' }}>{error}</span>}
        </div>
      )}
    </div>
  );
};

export default WalletConnect;
