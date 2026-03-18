import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import styles from './Modal.module.css';

type ModalState = {
  title: string;
  message: React.ReactNode;
  primaryText: string;
  secondaryText?: string;
  onPrimary?: () => void;
  onSecondary?: () => void;
};

type ModalApi = {
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

  const close = useCallback(() => setModal(null), []);

  const openAlert: ModalApi['openAlert'] = useCallback(({ title, message, primaryText }) => {
    setModal({
      title,
      message,
      primaryText: primaryText ?? '知道了',
      onPrimary: () => setModal(null),
    });
  }, []);

  const openConfirm: ModalApi['openConfirm'] = useCallback(
    ({ title, message, primaryText, secondaryText, onConfirm, onCancel }) => {
      setModal({
        title,
        message,
        primaryText: primaryText ?? '确定',
        secondaryText: secondaryText ?? '取消',
        onPrimary: () => {
          setModal(null);
          onConfirm();
        },
        onSecondary: () => {
          setModal(null);
          onCancel?.();
        },
      });
    },
    [],
  );

  const api = useMemo<ModalApi>(() => ({ openAlert, openConfirm, close }), [close, openAlert, openConfirm]);

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
            <div className={styles.body}>{modal.message}</div>
            <div className={styles.footer}>
              {modal.secondaryText ? (
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={modal.onSecondary ?? close}
                >
                  {modal.secondaryText}
                </button>
              ) : null}
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={modal.onPrimary ?? close}
              >
                {modal.primaryText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
};

