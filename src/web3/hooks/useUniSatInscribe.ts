import { useState, useCallback } from 'react';
import type { UniSatWallet, InscriptionResult } from '../types/unisat';
import { GAME_PROTOCOL } from '../config/constants';

export interface InscribeGameStateParams {
    version: string;
    daysSurvived: number;
    totalSurvivors: number;
    buildingsCount: number;
    resources: object;
    timestamp: number;
}

export const useUniSatInscribe = (unisat: UniSatWallet | null) => {
    const [isInscribing, setIsInscribing] = useState(false);
    const [result, setResult] = useState<InscriptionResult | null>(null);

    // 铭刻游戏状态
    const inscribeGameState = useCallback(
        async (gameState: InscribeGameStateParams): Promise<InscriptionResult> => {
            if (!unisat) {
                return { error: '请先连接 UniSat 钱包' };
            }

            setIsInscribing(true);
            setResult(null);

            try {
                // 构建铭刻内容
                const content = JSON.stringify({
                    p: GAME_PROTOCOL,
                    op: 'game-save',
                    v: gameState.version,
                    data: {
                        days: gameState.daysSurvived,
                        survivors: gameState.totalSurvivors,
                        buildings: gameState.buildingsCount,
                        resources: gameState.resources,
                    },
                    ts: gameState.timestamp,
                });

                // 调用 UniSat 铭刻 API
                const inscribeResult = await unisat.inscribe(content, {
                    contentType: 'application/json',
                });

                const successResult = {
                    inscriptionId: inscribeResult.inscriptionId,
                    txid: inscribeResult.txid,
                };

                setResult(successResult);
                return successResult;
            } catch (error: any) {
                const errorResult = { error: error.message || '铭刻失败' };
                setResult(errorResult);
                return errorResult;
            } finally {
                setIsInscribing(false);
            }
        },
        [unisat]
    );

    // 铭刻自定义内容
    const inscribeCustom = useCallback(
        async (
            content: string,
            contentType: string = 'text/plain'
        ): Promise<InscriptionResult> => {
            if (!unisat) {
                return { error: '请先连接 UniSat 钱包' };
            }

            setIsInscribing(true);
            setResult(null);

            try {
                const inscribeResult = await unisat.inscribe(content, { contentType });

                const successResult = {
                    inscriptionId: inscribeResult.inscriptionId,
                    txid: inscribeResult.txid,
                };

                setResult(successResult);
                return successResult;
            } catch (error: any) {
                const errorResult = { error: error.message || '铭刻失败' };
                setResult(errorResult);
                return errorResult;
            } finally {
                setIsInscribing(false);
            }
        },
        [unisat]
    );

    return {
        isInscribing,
        result,
        inscribeGameState,
        inscribeCustom,
    };
};

export default useUniSatInscribe;
