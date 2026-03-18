import React from 'react';
import type { NavigateFunction } from 'react-router-dom';
import type { ModalAction } from '@/shared/components/ModalProvider';
import type { ResourceNeedKey } from '@/shared/components/ResourceWays';
import { openResourceWays } from '@/shared/logic/openResourceWays';
import { formatRewardLines, type Reward } from '@/shared/logic/rewards';
import type { BattleResult } from '@/shared/logic/battleResult';
import { BattleReportView, createBattleReportFromResult } from '@/shared/logic/battleReports';

type ModalLike = {
  openModal: (p: { title: string; content: React.ReactNode; actions?: ModalAction[] }) => void;
  openAlert: (p: { title: string; message: React.ReactNode; primaryText?: string }) => void;
  openConfirm: (p: {
    title: string;
    message: React.ReactNode;
    primaryText?: string;
    secondaryText?: string;
    onConfirm: () => void;
    onCancel?: () => void;
  }) => void;
  close: () => void;
};

const renderRewardLines = (rewards: Reward[]) => {
  const lines = formatRewardLines(rewards);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {lines.map((l) => (
        <div
          key={`${l.label}-${l.amount}`}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 12,
            border: '1px solid var(--game-border)',
            borderRadius: 12,
            padding: '10px 12px',
            background: 'rgba(255,255,255,0.04)',
          }}
        >
          <div style={{ color: 'var(--game-text)' }}>{l.label}</div>
          <div style={{ color: 'var(--game-title)', fontFamily: 'var(--game-font-mono)' }}>
            +{l.amount}
          </div>
        </div>
      ))}
    </div>
  );
};

export const openRewardModal = (args: {
  modal: ModalLike;
  title?: string;
  rewards: Reward[];
  primaryText?: string;
}) => {
  args.modal.openModal({
    title: args.title ?? '获得奖励',
    content: renderRewardLines(args.rewards),
    actions: [
      {
        key: 'ok',
        label: args.primaryText ?? '知道了',
        variant: 'primary',
        onClick: () => args.modal.close(),
      },
    ],
  });
};

export const openRewardPreviewModal = (args: {
  modal: ModalLike;
  title?: string;
  rewards: Reward[];
}) => {
  args.modal.openModal({
    title: args.title ?? '奖励预览',
    content: renderRewardLines(args.rewards),
    actions: [
      {
        key: 'close',
        label: '关闭',
        variant: 'secondary',
        onClick: () => args.modal.close(),
      },
    ],
  });
};

export const openResourceLackModal = (args: {
  modal: ModalLike;
  navigate: NavigateFunction;
  resourceKey: ResourceNeedKey;
  title?: string;
  needAmount?: number;
  haveAmount?: number;
}) => {
  openResourceWays({
    modal: args.modal,
    navigate: args.navigate,
    resourceKey: args.resourceKey,
    title: args.title ?? '资源不足',
    needAmount: args.needAmount,
    haveAmount: args.haveAmount,
  });
};

export const openBattleReportModal = (args: { modal: ModalLike; result: BattleResult }) => {
  args.modal.openModal({
    title: '战报',
    content: <BattleReportView report={createBattleReportFromResult(args.result)} />,
    actions: [
      {
        key: 'close',
        label: '关闭',
        variant: 'secondary',
        onClick: () => args.modal.close(),
      },
    ],
  });
};

export const openAuctionResultModal = (args: {
  modal: ModalLike;
  itemName: string;
  isWinner: boolean;
  price: number;
  onGoBag?: () => void;
}) => {
  args.modal.openModal({
    title: '竞拍结果',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div
          style={{
            fontWeight: 900,
            color: args.isWinner ? 'var(--game-btn-confirm)' : 'var(--game-btn-battle)',
          }}
        >
          {args.isWinner ? '竞拍成功' : '竞拍失败'}
        </div>
        <div>物品：{args.itemName}</div>
        <div style={{ color: 'var(--game-text-muted)' }}>成交价：{args.price}</div>
      </div>
    ),
    actions: args.onGoBag
      ? [
          {
            key: 'close',
            label: '关闭',
            variant: 'secondary',
            onClick: () => args.modal.close(),
          },
          {
            key: 'bag',
            label: '查看背包',
            variant: 'primary',
            onClick: () => {
              args.modal.close();
              args.onGoBag?.();
            },
          },
        ]
      : [
          {
            key: 'close',
            label: '关闭',
            variant: 'secondary',
            onClick: () => args.modal.close(),
          },
        ],
  });
};
