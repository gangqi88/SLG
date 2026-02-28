// UniSat 常量定义

// API 配置
export const UNISAT_API_CONFIG = {
    BASE_URL: import.meta.env.VITE_UNISAT_API_BASE || 'https://api.unisat.io/query-v4',
    API_KEY: import.meta.env.VITE_UNISAT_API_KEY || '',
    TIMEOUT: 30000,
    RETRY_COUNT: 3,
} as const;

// 游戏协议标识
export const GAME_PROTOCOL = import.meta.env.VITE_GAME_PROTOCOL || 'endless-winter';

// BRC-20 配置
export const BRC20_CONFIG = {
    DECIMALS: 18,
    DEFAULT_TICKER: 'WINTER',
} as const;

// 交易配置
export const TRANSACTION_CONFIG = {
    MIN_FEE_RATE: 1,
    DEFAULT_FEE_RATE: 10,
    HIGH_FEE_RATE: 50,
} as const;

// 本地存储键
export const STORAGE_KEYS = {
    WALLET_ADDRESS: 'unisat_wallet_address',
    LAST_NETWORK: 'unisat_last_network',
    INSCRIPTION_HISTORY: 'game_inscription_history',
} as const;
