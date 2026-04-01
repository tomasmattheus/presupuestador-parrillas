import { useContext } from 'react';
import { ModalContext } from '../../contexts/ModalContext';

const TYPE_CLASSES: Record<string, string> = {
  success: 'bg-success',
  error: 'bg-danger',
  info: 'bg-brand',
};

export default function Toast() {
  const { toastMsg, toastType } = useContext(ModalContext);

  if (!toastMsg) return null;

  return (
    <div
      className={`fixed bottom-[30px] left-1/2 -translate-x-1/2 text-white py-2.5 px-6 rounded-lg text-sm font-semibold z-[1100] shadow-[0_4px_16px_rgba(0,0,0,0.3)] transition-opacity duration-300 ${TYPE_CLASSES[toastType] ?? 'bg-surface-card'}`}
    >
      {toastMsg}
    </div>
  );
}
