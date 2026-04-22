import { useState, useContext, useMemo, useRef, useEffect } from 'react';
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

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [search, setSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [monto, setMonto] = useState('');
  const [formaPago, setFormaPago] = useState('');
  const [estadoEntrega, setEstadoEntrega] = useState('Pendiente fabricacion');
  const [notas, setNotas] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return leads;
    const q = search.toLowerCase().trim();
    return leads.filter((l) =>
      (l.nombre || '').toLowerCase().includes(q) ||
      (l.ciudad || '').toLowerCase().includes(q) ||
      String(l.whatsapp || '').includes(q)
    );
  }, [leads, search]);

  function resetForm() {
    setSelectedLead(null);
    setSearch('');
    setMonto('');
    setFormaPago('');
    setEstadoEntrega('Pendiente fabricacion');
    setNotas('');
    setDropdownOpen(false);
  }

  function handleSelectLead(lead: Lead) {
    setSelectedLead(lead);
    setSearch('');
    setDropdownOpen(false);
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
    if (!selectedLead) {
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
        {selectedLead ? (
          <div className="flex items-center gap-2 bg-[#f0f7ff] border border-brand rounded-md py-2 px-3 mb-3">
            <span className="flex-1 text-sm font-semibold text-[#2a2a2a]">
              {selectedLead.nombre}
              {selectedLead.ciudad ? <span className="text-[#888] font-normal"> - {selectedLead.ciudad}</span> : ''}
            </span>
            <button
              onClick={() => setSelectedLead(null)}
              className="bg-transparent border-none text-[#888] text-lg cursor-pointer hover:text-[#333]"
            >
              &times;
            </button>
          </div>
        ) : (
          <div className="relative mb-3" ref={wrapperRef}>
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setDropdownOpen(true); }}
              onFocus={() => setDropdownOpen(true)}
              placeholder="Buscar por nombre, ciudad o telefono..."
              className="w-full bg-white border border-[#ddd] text-[#2a2a2a] py-2 px-3 rounded-md text-sm font-sans outline-none focus:border-brand"
            />
            {dropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#ddd] rounded-md shadow-lg z-50 max-h-[200px] overflow-y-auto">
                {filtered.length === 0 && (
                  <div className="px-3 py-3 text-[12px] text-[#999] text-center">Sin resultados</div>
                )}
                {filtered.map((l) => {
                  const waShort = l.whatsapp ? String(l.whatsapp).replace(/\D/g, '').slice(-4) : '';
                  return (
                    <div
                      key={l.rowIndex}
                      onClick={() => handleSelectLead(l)}
                      className="px-3 py-2.5 cursor-pointer hover:bg-[#f0f7ff] transition-colors border-b border-[#f5f5f5] last:border-b-0"
                    >
                      <div className="text-[13px] font-semibold text-[#2a2a2a]">{l.nombre}</div>
                      <div className="text-[11px] text-[#999] mt-0.5">
                        {l.ciudad || 'Sin ciudad'}{waShort ? ` \u00b7 ...${waShort}` : ''}{l.sistema ? ` \u00b7 ${l.sistema}` : ''}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

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
          disabled={submitting || !selectedLead}
          className="w-full bg-success text-white border-none py-2.5 rounded-md text-sm font-bold cursor-pointer font-sans hover:bg-[#059669] transition-colors disabled:opacity-50 disabled:pointer-events-none"
        >
          {submitting ? 'Registrando...' : 'Registrar venta'}
        </button>
      </div>
    </div>
  );
}
