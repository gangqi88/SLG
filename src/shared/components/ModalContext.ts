import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';

export type ModalAction = {
  key: string;
  label: string;
  variant?: 'primary' | 'secondary' | 'danger';
  onClick?: () => void;
};

export type ModalApi = {
  openModal: (args: { title: string; content: ReactNode; actions?: ModalAction[] }) => void;
  openAlert: (args: { title: string; message: ReactNode; primaryText?: string }) => void;
  openConfirm: (args: {
    title: string;
    message: ReactNode;
    primaryText?: string;
    secondaryText?: string;
    onConfirm: () => void;
    onCancel?: () => void;
  }) => void;
  close: () => void;
};

export const ModalContext = createContext<ModalApi | null>(null);

export const useModal = () => {
  const ctx = useContext(ModalContext);
  if (!ctx) {
    throw new Error('ModalContext is not available');
  }
  return ctx;
};
