import type { BRC20Balance, Inscription } from '../types/unisat';
import { UNISAT_API_CONFIG } from '../config/constants';

const API_BASE = UNISAT_API_CONFIG.BASE_URL;
const API_KEY = UNISAT_API_CONFIG.API_KEY;

export interface APIResponse<T> {
    code: number;
    msg: string;
    data: T;
}

export class UniSatAPI {
    private headers: Record<string, string>;

    constructor() {
        this.headers = {
            'Content-Type': 'application/json',
        };
        if (API_KEY) {
            this.headers['Authorization'] = `Bearer ${API_KEY}`;
        }
    }

    private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
        const url = `${API_BASE}${endpoint}`;

        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    ...this.headers,
                    ...options?.headers,
                },
            });

            if (!response.ok) {
                throw new Error(`UniSat API 错误 ${response.status}: ${response.statusText}`);
            }

            const result: APIResponse<T> = await response.json();

            if (result.code !== 0) {
                throw new Error(result.msg || 'API 请求失败');
            }

            return result.data;
        } catch (error) {
            console.error('UniSat API 请求失败:', error);
            throw error;
        }
    }

    // 获取 BRC-20 余额列表
    async getBRC20BalanceList(address: string): Promise<BRC20Balance[]> {
        try {
            return await this.request<BRC20Balance[]>(`/address/${address}/brc20/summary`);
        } catch (error) {
            console.error('获取 BRC-20 余额列表失败:', error);
            return [];
        }
    }

    // 获取指定 BRC-20 代币余额
    async getBRC20Balance(address: string, ticker: string): Promise<BRC20Balance | null> {
        try {
            return await this.request<BRC20Balance>(`/address/${address}/brc20/${ticker}`);
        } catch (error) {
            console.error(`获取 ${ticker} 余额失败:`, error);
            return null;
        }
    }

    // 获取 BRC-20 交易历史
    async getBRC20History(address: string, ticker?: string) {
        const endpoint = ticker
            ? `/address/${address}/brc20/${ticker}/history`
            : `/address/${address}/brc20/history`;

        try {
            return await this.request(endpoint);
        } catch (error) {
            console.error('获取 BRC-20 历史失败:', error);
            return [];
        }
    }

    // 获取铭文列表
    async getInscriptions(
        address: string,
        cursor?: number,
        size: number = 20
    ): Promise<{
        list: Inscription[];
        total: number;
    }> {
        const params = new URLSearchParams();
        if (cursor !== undefined) {
            params.append('cursor', cursor.toString());
        }
        params.append('size', size.toString());

        try {
            return await this.request<{
                list: Inscription[];
                total: number;
            }>(`/address/${address}/inscriptions?${params}`);
        } catch (error) {
            console.error('获取铭文列表失败:', error);
            return { list: [], total: 0 };
        }
    }

    // 获取交易历史
    async getTransactionHistory(address: string) {
        try {
            return await this.request(`/address/${address}/txs`);
        } catch (error) {
            console.error('获取交易历史失败:', error);
            return [];
        }
    }

    // 获取 FB 余额
    async getFBBalance(address: string): Promise<{
        confirmed: number;
        unconfirmed: number;
        total: number;
    }> {
        try {
            return await this.request<{
                confirmed: number;
                unconfirmed: number;
                total: number;
            }>(`/address/${address}/balance`);
        } catch (error) {
            console.error('获取 FB 余额失败:', error);
            return { confirmed: 0, unconfirmed: 0, total: 0 };
        }
    }

    // 获取 BRC-20 代币信息
    async getBRC20Info(ticker: string) {
        try {
            return await this.request(`/brc20/${ticker}`);
        } catch (error) {
            console.error(`获取 ${ticker} 信息失败:`, error);
            return null;
        }
    }

    // 获取 BRC-20 持有者列表
    async getBRC20Holders(
        ticker: string,
        cursor?: number,
        size: number = 20
    ) {
        const params = new URLSearchParams();
        if (cursor !== undefined) {
            params.append('cursor', cursor.toString());
        }
        params.append('size', size.toString());

        try {
            return await this.request(`/brc20/${ticker}/holders?${params}`);
        } catch (error) {
            console.error('获取持有者列表失败:', error);
            return [];
        }
    }
}

// 导出单例
export const unisatAPI = new UniSatAPI();
export default unisatAPI;
