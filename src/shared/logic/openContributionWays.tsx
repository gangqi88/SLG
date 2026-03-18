import React from 'react';
import type { NavigateFunction } from 'react-router-dom';
import type { ModalAction } from '@/shared/components/ModalProvider';
import { ContributionWaysContent } from '@/shared/components/ContributionWays';

export const openContributionWays = (args: {
  modal: { openModal: (p: { title: string; content: React.ReactNode; actions?: ModalAction[] }) => void; close: () => void };
  navigate: NavigateFunction;
}) => {
  const { modal, navigate } = args;
  modal.openModal({
    title: '贡献获取途径',
    content: (
      <ContributionWaysContent
        onGo={(to) => {
          modal.close();
          navigate(to);
        }}
      />
    ),
    actions: [{ key: 'close', label: '关闭', variant: 'secondary', onClick: () => modal.close() }],
  });
};

