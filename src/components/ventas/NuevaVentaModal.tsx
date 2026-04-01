import { useState, useContext, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useLeads } from '../../hooks/useLeads';
import { saveVenta } from '../../services/ventas.service';
import { updateLeadField } from '../../services/leads.service';
import { formatPrice, parsePriceInput } from '../../lib/formatters';
import { ModalContext } from '../../contexts/ModalContext';
import type { Lead } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const PAGO_OPTIONS = ['', '100% anticipado', '50/50', '3 cuotas', 'Otro'];
const ENTREGA_OPTIONS = ['Pendiente fabricacion', 'En fabricacion', 'Listo para entregar', 'Entregado e instalado'];

function getVentaKey(lead: Lead): string {
  return (lead.nombre || '') + '|' + (lead.whatsapp || '');
}

export default function NuevaVentaModal({ isOpen, onClose }: Props) {
  const { data: leads = [] } = useLeads();
  const { showToast } = useContext(ModalContext);
  const queryClient = useQueryClient();

  const [selectedIdx, setSelectedIdx] = useState('');
  const [monto, setMonto] = useState('');
  const [formaPago, setFormaPago] = useState('');
  const [estadoEntrega, setEstadoEntrega] = useState('Pendiente fabricacion');
  const [notas, setNotas] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const selectedLead = useMemo(() => {
    if (selectedIdx === '') return null;
    return leads[parseInt(selectedIdx)] || null;
  }, [selectedIdx, leads]);

  function resetForm() {
    setSelectedIdx('');
    setMonto('');
    setFormaPago('');
    setEstadoEntrega('Pendiente fabricacion');
    setNotas('');
  }

  function handleMontoFocus() {
    const num = parsePriceInput(monto);
    setMonto(num > 0 ? String(num) : '');
  }

  function handleMontoBlur() {
    const num = parsePriceInput(monto);
    setMonto(num > 0 ? formatPrice(num) : '');
  }

  async function handleSubmit() {
    if (selectedIdx === '' || !selectedLead) {
      showToast('Debe seleccionar un cliente', 'error');
      return;
    }
    const montoNum = parsePriceInput(monto);
    if (montoNum <= 0) {
      showToast('El monto debe ser mayor a 0', 'error');
      return;
    }
    setSubmitting(true);

    const key = getVentaKey(selectedLead);

    try {
      await updateLeadField(selectedLead.rowIndex, 4, 'Cerrado Ganado');
      await saveVenta(key, {
        monto: montoNum,
        formaPago: formaPago.trim(),
        estadoEntrega: estadoEntrega.trim(),
        notas: notas.trim(),
      });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['ventas'] });
      showToast('Venta registrada', 'success');
      resetForm();
      onClose();
    } catch {
      showToast('Error al registrar venta', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[600]"
      onClick={(e) => { if (e.target === e.currentTarget) { resetForm(); onClose(); } }}
    >
      <div className="bg-white rounded-xl w-full max-w-[460px] p-6 relative shadow-[0_8px_30px_rgba(0,0,0,0.15)]">
        <button
          onClick={() => { resetForm(); onClose(); }}
          className="absolute top-4 right-4 text-[#888] text-2xl bg-transparent border-none cursor-pointer hover:text-[#2a2a2a]"
        >
          &times;
        </button>
        <h2 className="text-xl font-black text-[#2a2a2a] mb-4">Nueva venta</h2>

        <label className="block text-xs font-semibold text-[#888] uppercase tracking-wide mb-1">Cliente *</label>
        <select
          value={selectedIdx}
          onChange={(e) => setSelectedIdx(e.target.value)}
          className="w-full bg-white border border-[#ddd] text-[#2a2a2a] py-2 px-3 rounded-md text-sm font-sans mb-3 outline-none focus:border-brand"
        >
          <option value="">-- Seleccionar cliente --</option>
          {leads.map((lead, idx) => (
            <option key={lead.rowIndex} value={idx}>
              {lead.nombre}{lead.ciudad ? ' - ' + lead.ciudad : ''}
            </option>
          ))}
        </select>

        {selectedLead && (
          <div className="flex gap-3 mb-3 text-xs text-[#666] bg-[#fafafa] rounded-md py-2 px-3">
            <span>{selectedLead.sistema || '-'}</span>
            <span>{selectedLead.material || '-'}</span>
            <span>{selectedLead.hasMeasures ? selectedLead.ancho + ' x ' + selectedLead.alto + ' cm' : '-'}</span>
          </div>
        )}

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
            <option key={opt} value={opt}>{opt}</option>
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
          disabled={submitting || selectedIdx === ''}
          className="w-full bg-success text-white border-none py-2.5 rounded-md text-sm font-bold cursor-pointer font-sans hover:bg-[#059669] transition-colors disabled:opacity-50 disabled:pointer-events-none"
        >
          {submitting ? 'Registrando...' : 'Registrar venta'}
        </button>
      </div>
    </div>
  );
}
