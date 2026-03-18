import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import styles from './Modal.module.css';
import { useLocale } from '@/shared/locale/LocaleProvider';

export type ModalAction = {
  key: string;
  label: string;
  variant?: 'primary' | 'secondary' | 'danger';
  onClick?: () => void;
};

type ModalState = {
  title: string;
  content: React.ReactNode;
  actions: ModalAction[];
};

type ModalApi = {
  openModal: (args: { title: string; content: React.ReactNode; actions?: ModalAction[] }) => void;
  openAlert: (args: { title: string; message: React.ReactNode; primaryText?: string }) => void;
  openConfirm: (args: {
    title: string;
    message: React.ReactNode;
    primaryText?: string;
    secondaryText?: string;
    onConfirm: () => void;
    onCancel?: () => void;
  }) => void;
  close: () => void;
};

const ModalContext = createContext<ModalApi | null>(null);

export const useModal = () => {
  const ctx = useContext(ModalContext);
  if (!ctx) {
    throw new Error('ModalContext is not available');
  }
  return ctx;
};

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modal, setModal] = useState<ModalState | null>(null);
  const { t } = useLocale();

  const close = useCallback(() => setModal(null), []);

  useEffect(() => {
    if (!modal) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [close, modal]);

  const openModal: ModalApi['openModal'] = useCallback(({ title, content, actions }) => {
    setModal({
      title,
      content,
      actions:
        actions && actions.length > 0
          ? actions
          : [
              {
                key: 'ok',
                label: t('modalOk'),
                variant: 'primary',
                onClick: () => setModal(null),
              },
            ],
    });
  }, [t]);

  const openAlert: ModalApi['openAlert'] = useCallback(({ title, message, primaryText }) => {
    openModal({
      title,
      content: message,
      actions: [
        {
          key: 'ok',
          label: primaryText ?? t('modalOk'),
          variant: 'primary',
          onClick: () => setModal(null),
        },
      ],
    });
  }, [openModal, t]);

  const openConfirm: ModalApi['openConfirm'] = useCallback(
    ({ title, message, primaryText, secondaryText, onConfirm, onCancel }) => {
      openModal({
        title,
        content: message,
        actions: [
          {
            key: 'cancel',
            label: secondaryText ?? t('modalCancel'),
            variant: 'secondary',
            onClick: () => {
              setModal(null);
              onCancel?.();
            },
          },
          {
            key: 'confirm',
            label: primaryText ?? t('modalConfirm'),
            variant: 'primary',
            onClick: () => {
              setModal(null);
              onConfirm();
            },
          },
        ],
      });
    },
    [openModal, t],
  );

  const api = useMemo<ModalApi>(
    () => ({ openModal, openAlert, openConfirm, close }),
    [close, openAlert, openConfirm, openModal],
  );

  return (
    <ModalContext.Provider value={api}>
      {children}
      {modal && (
        <div
          className={styles.overlay}
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div className={styles.modal} role="dialog" aria-modal="true" aria-label={modal.title}>
            <div className={styles.header}>
              <h2 className={styles.title}>{modal.title}</h2>
              <button type="button" className={styles.closeBtn} onClick={close} aria-label="关闭">
                ×
              </button>
            </div>
            <div className={styles.body}>{modal.content}</div>
            <div className={styles.footer}>
              {modal.actions.map((a) => (
                <button
                  type="button"
                  key={a.key}
                  className={
                    a.variant === 'danger'
                      ? styles.btnDanger
                      : a.variant === 'secondary'
                        ? styles.btnSecondary
                        : styles.btnPrimary
                  }
                  onClick={a.onClick ?? close}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
};
