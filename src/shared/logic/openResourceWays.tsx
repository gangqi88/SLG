import React from 'react';
import type { NavigateFunction } from 'react-router-dom';
import type { ModalAction } from '@/shared/components/ModalContext';
import { ResourceWaysContent } from '@/shared/components/ResourceWays';
import type { ResourceNeedKey } from '@/shared/logic/resourceWays';

export const openResourceWays = (args: {
  modal: {
    openModal: (p: { title: string; content: React.ReactNode; actions?: ModalAction[] }) => void;
    close: () => void;
  };
  navigate: NavigateFunction;
  resourceKey: ResourceNeedKey;
  needAmount?: number;
  haveAmount?: number;
  title?: string;
}) => {
  const { modal, navigate, resourceKey, title, needAmount, haveAmount } = args;
  modal.openModal({
    title: title ?? '获取途径',
    content: (
      <ResourceWaysContent
        resourceKey={resourceKey}
        needAmount={needAmount}
        haveAmount={haveAmount}
        onGo={(to) => {
          modal.close();
          navigate(to);
        }}
      />
    ),
    actions: [{ key: 'close', label: '关闭', variant: 'secondary', onClick: () => modal.close() }],
  });
};
