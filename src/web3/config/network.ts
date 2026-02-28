// UniSat 支持的 Fractal Bitcoin 网络配置

export interface UniSatNetworkConfig {
    name: string;
    unisatNetwork: string;
    explorer: string;
    apiBase: string;
    wsBase: string;
}

export const UNISAT_NETWORKS = {
    fractalMainnet: {
        name: 'Fractal Bitcoin',
        unisatNetwork: 'fractal_mainnet',
        explorer: 'https://explorer.fractalbitcoin.io',
        apiBase: 'https://api.unisat.io/query-v4',
        wsBase: 'wss://api.unisat.io/query-v4/ws',
    },
    fractalTestnet: {
        name: 'Fractal Bitcoin Testnet',
        unisatNetwork: 'fractal_testnet',
        explorer: 'https://explorer-testnet.fractalbitcoin.io',
        apiBase: 'https://api.unisat.io/query-v4',
        wsBase: 'wss://api.unisat.io/query-v4/ws',
    },
} as const;

export type UniSatNetwork = typeof UNISAT_NETWORKS[keyof typeof UNISAT_NETWORKS];

// 当前网络
export const CURRENT_NETWORK: UniSatNetwork =
    import.meta.env.VITE_FB_NETWORK === 'mainnet'
        ? UNISAT_NETWORKS.fractalMainnet
        : UNISAT_NETWORKS.fractalTestnet;

// 网络切换帮助函数
export const getNetworkByName = (networkName: string): UniSatNetwork => {
    if (networkName === 'fractal_mainnet') {
        return UNISAT_NETWORKS.fractalMainnet;
    }
    return UNISAT_NETWORKS.fractalTestnet;
};
