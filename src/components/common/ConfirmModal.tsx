import { useContext } from 'react';
import { ModalContext } from '../../contexts/ModalContext';

export default function ConfirmModal() {
  const { confirmConfig, closeConfirm, executeConfirm, confirmLoading } = useContext(ModalContext);

  if (!confirmConfig) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 z-[2000] flex items-center justify-center"
      onClick={confirmLoading ? undefined : closeConfirm}
    >
      <div
        className="bg-white rounded-xl py-7 px-8 max-w-[380px] w-[90%] shadow-[0_20px_60px_rgba(0,0,0,0.25)] text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-bold text-surface-card mb-1.5">
          {confirmConfig.title}
        </h3>
        <p className="text-[13px] text-[#888] mb-5">
          {confirmConfig.text}
        </p>
        <div className="flex gap-2.5 justify-center">
          <button
            onClick={closeConfirm}
            disabled={confirmLoading}
            className="py-2.5 px-6 rounded-md border-none text-sm font-semibold cursor-pointer font-sans bg-[#f0f0f0] text-[#666] hover:bg-[#e0e0e0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={executeConfirm}
            disabled={confirmLoading}
            className="py-2.5 px-6 rounded-md border-none text-sm font-semibold cursor-pointer font-sans bg-danger text-white hover:bg-danger-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {confirmLoading ? 'Eliminando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}
