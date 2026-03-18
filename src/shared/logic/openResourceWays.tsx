import React from 'react';
import type { NavigateFunction } from 'react-router-dom';
import type { ModalAction } from '@/shared/components/ModalProvider';
import { ResourceWaysContent, type ResourceNeedKey } from '@/shared/components/ResourceWays';

export const openResourceWays = (args: {
  modal: { openModal: (p: { title: string; content: React.ReactNode; actions?: ModalAction[] }) => void; close: () => void };
  navigate: NavigateFunction;
  resourceKey: ResourceNeedKey;
  title?: string;
}) => {
  const { modal, navigate, resourceKey, title } = args;
  modal.openModal({
    title: title ?? '获取途径',
    content: (
      <ResourceWaysContent
        resourceKey={resourceKey}
        onGo={(to) => {
          modal.close();
          navigate(to);
        }}
      />
    ),
    actions: [{ key: 'close', label: '关闭', variant: 'secondary', onClick: () => modal.close() }],
  });
};
