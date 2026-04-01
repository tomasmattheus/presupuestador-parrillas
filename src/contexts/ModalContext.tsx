import { createContext, useState, useCallback, useRef, type ReactNode } from 'react';
import type { Lead } from '../types';

interface ConfirmConfig {
  title: string;
  text: string;
  onConfirm: () => void | Promise<void>;
}

interface ModalContextValue {
  confirmConfig: ConfirmConfig | null;
  leadModalLead: Lead | null;
  toastMsg: string;
  toastType: 'success' | 'error' | 'info';
  confirmLoading: boolean;
  pendingPresupLead: Lead | null;
  showConfirm: (title: string, text: string, onConfirm: () => void | Promise<void>) => void;
  closeConfirm: () => void;
  executeConfirm: () => void;
  openLeadModal: (lead: Lead) => void;
  closeLeadModal: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: () => void;
  requestGeneratePresup: (lead: Lead) => void;
  clearPendingPresupLead: () => void;
}

export const ModalContext = createContext<ModalContextValue>({
  confirmConfig: null,
  leadModalLead: null,
  toastMsg: '',
  toastType: 'info',
  confirmLoading: false,
  pendingPresupLead: null,
  showConfirm: () => {},
  closeConfirm: () => {},
  executeConfirm: () => {},
  openLeadModal: () => {},
  closeLeadModal: () => {},
  showToast: () => {},
  hideToast: () => {},
  requestGeneratePresup: () => {},
  clearPendingPresupLead: () => {},
});

export function ModalProvider({ children }: { children: ReactNode }) {
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [leadModalLead, setLeadModalLead] = useState<Lead | null>(null);
  const [pendingPresupLead, setPendingPresupLead] = useState<Lead | null>(null);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const showConfirm = useCallback((title: string, text: string, onConfirm: () => void | Promise<void>) => {
    setConfirmConfig({ title, text, onConfirm });
  }, []);

  const closeConfirm = useCallback(() => {
    if (confirmLoading) return;
    setConfirmConfig(null);
  }, [confirmLoading]);

  const executeConfirm = useCallback(async () => {
    if (!confirmConfig?.onConfirm) return;
    setConfirmLoading(true);
    try {
      await confirmConfig.onConfirm();
    } catch (err) {
      console.error('Error executing confirm action:', err);
    } finally {
      setConfirmLoading(false);
      setConfirmConfig(null);
    }
  }, [confirmConfig]);

  const openLeadModal = useCallback((lead: Lead) => {
    setLeadModalLead(lead);
  }, []);

  const closeLeadModal = useCallback(() => {
    setLeadModalLead(null);
  }, []);

  const requestGeneratePresup = useCallback((lead: Lead) => {
    setLeadModalLead(null);
    setPendingPresupLead(lead);
  }, []);

  const clearPendingPresupLead = useCallback(() => {
    setPendingPresupLead(null);
  }, []);

  const hideToast = useCallback(() => {
    setToastMsg('');
  }, []);

  const showToast = useCallback((msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMsg(msg);
    setToastType(type);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(''), 3000);
  }, []);

  return (
    <ModalContext.Provider value={{
      confirmConfig,
      leadModalLead,
      toastMsg,
      toastType,
      confirmLoading,
      pendingPresupLead,
      showConfirm,
      closeConfirm,
      executeConfirm,
      openLeadModal,
      closeLeadModal,
      showToast,
      hideToast,
      requestGeneratePresup,
      clearPendingPresupLead,
    }}>
      {children}
    </ModalContext.Provider>
  );
}
