import { useState, useEffect, useContext } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { saveVenta } from '../../services/ventas.service';
import { formatPrice, parsePriceInput } from '../../lib/formatters';
import { ModalContext } from '../../contexts/ModalContext';
import type { VentaStore } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  ventaKey: string;
  ventaData: VentaStore | null;
}

const PAGO_OPTIONS = ['', '100% anticipado', '50/50', '3 cuotas', 'Otro'];
const ENTREGA_OPTIONS = ['', 'Pendiente fabricacion', 'En fabricacion', 'Listo para entregar', 'Entregado e instalado'];

export default function EditVentaModal({ isOpen, onClose, ventaKey, ventaData }: Props) {
  const { showToast } = useContext(ModalContext);
  const queryClient = useQueryClient();

  const [monto, setMonto] = useState('');
  const [formaPago, setFormaPago] = useState('');
  const [estadoEntrega, setEstadoEntrega] = useState('');
  const [notas, setNotas] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && ventaData) {
      setMonto(ventaData.monto ? formatPrice(ventaData.monto) : '');
      setFormaPago(ventaData.formaPago || '');
      setEstadoEntrega(ventaData.estadoEntrega || '');
      setNotas(ventaData.notas || '');
    }
  }, [isOpen, ventaData]);

  function handleMontoFocus() {
    const num = parsePriceInput(monto);
    setMonto(num > 0 ? String(num) : '');
  }

  function handleMontoBlur() {
    const num = parsePriceInput(monto);
    setMonto(num > 0 ? formatPrice(num) : '');
  }

  async function handleSubmit() {
    setSubmitting(true);
    const montoNum = parsePriceInput(monto);
    try {
      await saveVenta(ventaKey, {
        monto: montoNum,
        formaPago,
        estadoEntrega,
        notas,
      });
      queryClient.invalidateQueries({ queryKey: ['ventas'] });
      showToast('Venta actualizada', 'success');
      onClose();
    } catch {
      showToast('Error al actualizar venta', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[600]"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-xl w-full max-w-[460px] p-6 relative shadow-[0_8px_30px_rgba(0,0,0,0.15)]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#888] text-2xl bg-transparent border-none cursor-pointer hover:text-[#2a2a2a]"
        >
          &times;
        </button>
        <h2 className="text-xl font-black text-[#2a2a2a] mb-4">Editar venta</h2>
        <p className="text-xs text-[#888] mb-4 truncate">{ventaKey.replace('|', ' - ')}</p>

        <label className="block text-xs font-semibold text-[#888] uppercase tracking-wide mb-1">Monto</label>
        <input
          type="text"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          onFocus={handleMontoFocus}
          onBlur={handleMontoBlur}
          placeholder="$ 0"
          className="w-full bg-white border border-[#ddd] text-[#2a2a2a] py-2 px-3 rounded-md text-sm font-sans mb-3 outline-none focus:border-brand"
        />

        <label className="block text-xs font-semibold text-[#888] uppercase tracking-wide mb-1">Forma de pago</label>
        <select
          value={formaPago}
          onChange={(e) => setFormaPago(e.target.value)}
          className="w-full bg-white border border-[#ddd] text-[#2a2a2a] py-2 px-3 rounded-md text-sm font-sans mb-3 outline-none focus:border-brand"
        >
          {PAGO_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt || '-- Seleccionar --'}</option>
          ))}
        </select>

        <label className="block text-xs font-semibold text-[#888] uppercase tracking-wide mb-1">Estado entrega</label>
        <select
          value={estadoEntrega}
          onChange={(e) => setEstadoEntrega(e.target.value)}
          className="w-full bg-white border border-[#ddd] text-[#2a2a2a] py-2 px-3 rounded-md text-sm font-sans mb-3 outline-none focus:border-brand"
        >
          {ENTREGA_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt || '-- Seleccionar --'}</option>
          ))}
        </select>

        <label className="block text-xs font-semibold text-[#888] uppercase tracking-wide mb-1">Notas</label>
        <textarea
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          rows={3}
          placeholder="Notas adicionales..."
          className="w-full bg-white border border-[#ddd] text-[#2a2a2a] py-2 px-3 rounded-md text-sm font-sans mb-4 outline-none focus:border-brand resize-y min-h-[60px]"
        />

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-success text-white border-none py-2.5 rounded-md text-sm font-bold cursor-pointer font-sans hover:bg-[#059669] transition-colors disabled:opacity-50 disabled:pointer-events-none"
        >
          {submitting ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  );
}
