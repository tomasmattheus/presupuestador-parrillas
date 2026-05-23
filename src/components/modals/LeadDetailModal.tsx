import { useContext, useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Lead, VentaStore } from '../../types';
import { ModalContext } from '../../contexts/ModalContext';
import { formatDateAR, parseGoogleDate, getDaysFromDate } from '../../lib/dates';
import { updateLeadField } from '../../services/leads.service';
import { saveVenta } from '../../services/ventas.service';
import { useVentas } from '../../hooks/useVentas';
import { usePresupuestos } from '../../hooks/usePresupuestos';
import { usePipelineStages } from '../../hooks/usePipelineStages';
import { formatPrice, parsePriceInput } from '../../lib/formatters';
import { getInitials, getAvatarColor } from '../../lib/avatar';
import BudgetHistorySection from './BudgetHistorySection';
import NotesSection from './NotesSection';
import MessageTemplatesSection from './MessageTemplatesSection';
import StageTracker from './StageTracker';
import { Select } from '../ui/select';

const PAGO_OPTIONS = ['', '100% anticipado', '50/50', '3 cuotas', 'Otro'];
const ENTREGA_OPTIONS = ['Pendiente fabricacion', 'En fabricacion', 'Listo para entregar', 'Entregado e instalado'];

type TabId = 'actividad' | 'presupuestos' | 'notas' | 'mensajes';

function toISODate(raw: string | null | undefined): string {
  if (!raw) return '';
  const d = parseGoogleDate(raw);
  if (!d || isNaN(d.getTime())) return '';
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function parseSeguimientoToInput(raw: string): string {
  return toISODate(raw);
}

function DataField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col py-1.5">
      <span className="text-[10px] text-[#888] font-semibold uppercase tracking-wider mb-0.5">{label}</span>
      <span className="text-[13px] text-[#2a2a2a] font-medium break-words">{children}</span>
    </div>
  );
}

function EditableMedida({ value, onSave, placeholder }: { value: string; onSave: (val: string) => void; placeholder: string }) {
  const [local, setLocal] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => { setLocal(value); }, [value]);
  const handleChange = (val: string) => {
    setLocal(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onSave(val), 600);
  };
  return (
    <input
      type="text"
      value={local}
      onChange={(e) => handleChange(e.target.value)}
      onBlur={() => { if (timerRef.current) clearTimeout(timerRef.current); if (local !== value) onSave(local); }}
      placeholder={placeholder}
      className="bg-white border border-[#e5e5e5] focus:border-brand text-[12px] text-[#2a2a2a] font-medium font-sans px-1.5 py-1 rounded outline-none w-full"
    />
  );
}

function EditableField({
  label,
  value,
  onSave,
  multiline,
  placeholder,
}: {
  label: string;
  value: string;
  onSave: (val: string) => void;
  multiline?: boolean;
  placeholder?: string;
}) {
  const [local, setLocal] = useState(value);
  const [savedFlag, setSavedFlag] = useState<'idle' | 'saving' | 'saved'>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => { setLocal(value); }, [value]);

  const handleChange = (val: string) => {
    setLocal(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    setSavedFlag('saving');
    timerRef.current = setTimeout(() => {
      onSave(val);
      setSavedFlag('saved');
      setTimeout(() => setSavedFlag('idle'), 1200);
    }, 600);
  };

  const handleBlur = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (local !== value) {
      onSave(local);
      setSavedFlag('saved');
      setTimeout(() => setSavedFlag('idle'), 1200);
    }
  };

  return (
    <div className="flex flex-col py-1.5">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[10px] text-[#888] font-semibold uppercase tracking-wider">{label}</span>
        {savedFlag === 'saving' && <span className="text-[9px] text-[#888]">…</span>}
        {savedFlag === 'saved' && <span className="text-[9px] text-[#059669] font-bold">✓</span>}
      </div>
      {multiline ? (
        <textarea
          value={local}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          placeholder={placeholder || '-'}
          rows={2}
          className="w-full bg-transparent border border-transparent hover:border-[#e5e5e5] focus:border-brand text-[13px] text-[#2a2a2a] font-medium font-sans px-1.5 py-1 rounded outline-none resize-y min-h-[36px]"
        />
      ) : (
        <input
          type="text"
          value={local}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          placeholder={placeholder || '-'}
          className="w-full bg-transparent border border-transparent hover:border-[#e5e5e5] focus:border-brand text-[13px] text-[#2a2a2a] font-medium font-sans px-1.5 py-1 rounded outline-none"
        />
      )}
    </div>
  );
}

type ActivityType = 'contact' | 'budget' | 'stage' | 'venta' | 'entrega' | 'seguimiento';

const TYPE_PRIORITY: Record<ActivityType, number> = {
  contact: 1,
  budget: 2,
  stage: 3,
  venta: 4,
  entrega: 5,
  seguimiento: 6,
};

interface ActivityEvent {
  date: Date;
  type: ActivityType;
  iconColor: string;
  title: string;
  detail?: string;
}

function buildActivityFeed(
  lead: Lead,
  budgets: Array<{ nro: string; fecha: string; total: number; cliente: string; telefono: string }>,
  venta: VentaStore | undefined,
): ActivityEvent[] {
  const events: ActivityEvent[] = [];

  if (lead.fecha) {
    const d = parseGoogleDate(lead.fecha);
    if (d && !isNaN(d.getTime())) {
      events.push({
        date: d,
        type: 'contact',
        iconColor: '#1DA1F2',
        title: 'Primer contacto',
        detail: lead.ciudad ? `desde ${lead.ciudad}` : undefined,
      });
    }
  }

  const leadName = (lead.nombre || '').trim().toLowerCase();
  const leadPhone = String(lead.whatsapp || '').replace(/\D/g, '').slice(-10);
  const relatedBudgets = budgets.filter((b) => {
    const bName = (b.cliente || '').trim().toLowerCase();
    const bPhone = String(b.telefono || '').replace(/\D/g, '').slice(-10);
    return (leadName && bName === leadName) || (leadPhone && bPhone === leadPhone);
  });

  relatedBudgets.forEach((b) => {
    const d = parseGoogleDate(b.fecha);
    if (d && !isNaN(d.getTime())) {
      events.push({
        date: d,
        type: 'budget',
        iconColor: '#f59e0b',
        title: `Presupuesto #${b.nro} enviado`,
        detail: formatPrice(b.total),
      });
    }
  });

  if (venta?.fechaCierre) {
    const d = parseGoogleDate(venta.fechaCierre);
    if (d && !isNaN(d.getTime())) {
      events.push({
        date: d,
        type: 'venta',
        iconColor: '#10b981',
        title: 'Venta cerrada',
        detail: venta.monto > 0 ? formatPrice(venta.monto) : undefined,
      });
    }
  }

  if (venta?.fechaEntrega) {
    const d = parseGoogleDate(venta.fechaEntrega);
    if (d && !isNaN(d.getTime())) {
      const isPast = d.getTime() < Date.now();
      events.push({
        date: d,
        type: 'entrega',
        iconColor: isPast ? '#10b981' : '#888',
        title: isPast ? 'Entregado' : 'Entrega programada',
      });
    }
  }

  if (lead.seguimiento) {
    const d = parseGoogleDate(lead.seguimiento);
    if (d && !isNaN(d.getTime())) {
      events.push({
        date: d,
        type: 'seguimiento',
        iconColor: '#1DA1F2',
        title: 'Seguimiento programado',
      });
    }
  }

  return events.sort((a, b) => {
    const dt = b.date.getTime() - a.date.getTime();
    if (dt !== 0) return dt;
    return TYPE_PRIORITY[a.type] - TYPE_PRIORITY[b.type];
  });
}

function ActivityTimeline({ events }: { events: ActivityEvent[] }) {
  if (events.length === 0) {
    return <div className="text-[13px] text-[#888] py-6 text-center">Sin actividad registrada</div>;
  }
  return (
    <div className="relative">
      <div className="absolute left-[7px] top-2 bottom-2 w-px bg-[#eee]" />
      {events.map((e, i) => (
        <div key={i} className="flex gap-3 pb-4 relative">
          <div
            className="w-[15px] h-[15px] rounded-full shrink-0 mt-0.5 z-10 ring-4 ring-white"
            style={{ background: e.iconColor }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-2">
              <div className="text-[13px] font-semibold text-[#2a2a2a]">{e.title}</div>
              <div className="text-[11px] text-[#888] shrink-0">{formatDateAR(e.date.toISOString())}</div>
            </div>
            {e.detail && <div className="text-[12px] text-[#666] mt-0.5">{e.detail}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function LeadDetailModal() {
  const { leadModalLead: lead, closeLeadModal, requestGeneratePresup } = useContext(ModalContext);
  const queryClient = useQueryClient();
  const { ventasMap = {} } = useVentas();
  const { budgetsFlat } = usePresupuestos();
  const { stages } = usePipelineStages();
  const [tab, setTab] = useState<TabId>('actividad');
  const [followUp, setFollowUp] = useState('');
  const [followUpSaved, setFollowUpSaved] = useState(true);

  const ventaKey = lead ? (lead.nombre || '') + '|' + (lead.whatsapp || '') : '';
  const ventaData: VentaStore | undefined = ventasMap[ventaKey];

  const [monto, setMonto] = useState('');
  const [formaPago, setFormaPago] = useState('');
  const [estadoEntrega, setEstadoEntrega] = useState('Pendiente fabricacion');
  const [fechaCierre, setFechaCierre] = useState('');
  const [fechaEntrega, setFechaEntrega] = useState('');
  const [ventaSavedFlag, setVentaSavedFlag] = useState<'idle' | 'saving' | 'saved'>('idle');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (lead) {
      setFollowUp(parseSeguimientoToInput(lead.seguimiento));
      setTab('actividad');
    }
  }, [lead]);

  useEffect(() => {
    if (!lead) return;
    setMonto(ventaData?.monto ? formatPrice(ventaData.monto) : '');
    setFormaPago(ventaData?.formaPago || '');
    setEstadoEntrega(ventaData?.estadoEntrega || 'Pendiente fabricacion');
    setFechaCierre(toISODate(ventaData?.fechaCierre));
    setFechaEntrega(toISODate(ventaData?.fechaEntrega));
    setVentaSavedFlag('idle');
  }, [lead, ventaData]);

  const persistVenta = useCallback((next: Partial<VentaStore>) => {
    if (!lead) return;
    const current: VentaStore = ventaData || {
      monto: 0, formaPago: '', estadoEntrega: '', notas: '', fechaCierre: '', fechaEntrega: '',
    };
    const updated: VentaStore = { ...current, ...next };
    setVentaSavedFlag('saving');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      saveVenta(ventaKey, updated)
        .then(() => {
          setVentaSavedFlag('saved');
          queryClient.invalidateQueries({ queryKey: ['ventas'] });
          setTimeout(() => setVentaSavedFlag('idle'), 1500);
        })
        .catch(() => setVentaSavedFlag('idle'));
    }, 500);
  }, [lead, ventaData, ventaKey, queryClient]);

  const activityEvents = useMemo(() => {
    if (!lead) return [];
    return buildActivityFeed(lead, budgetsFlat, ventaData);
  }, [lead, budgetsFlat, ventaData]);

  const handleMontoBlur = useCallback(() => {
    const num = parsePriceInput(monto);
    setMonto(num > 0 ? formatPrice(num) : '');
    persistVenta({ monto: num });
  }, [monto, persistVenta]);

  const saveLeadField = useCallback((col: number, value: string, key: keyof Lead) => {
    if (!lead) return;
    queryClient.setQueryData<Lead[]>(['leads'], (old) => {
      const updated = (old || []).map((l) =>
        l.rowIndex === lead.rowIndex ? { ...l, [key]: value } : l
      );
      try { localStorage.setItem('qd_cache_leads', JSON.stringify(updated)); } catch {}
      return updated;
    });
    updateLeadField(lead.rowIndex, col, value).catch(() => {});
  }, [lead, queryClient]);

  const confirmFollowUp = useCallback(() => {
    if (!lead || !followUp) return;
    updateLeadField(lead.rowIndex, 13, followUp);
    setTimeout(() => updateLeadField(lead.rowIndex, 13, followUp), 2000);
    queryClient.setQueryData<Lead[]>(['leads'], (old) => {
      const updated = (old || []).map((l) =>
        l.rowIndex === lead.rowIndex ? { ...l, seguimiento: followUp } : l
      );
      try { localStorage.setItem('qd_cache_leads', JSON.stringify(updated)); } catch {}
      return updated;
    });
    setFollowUpSaved(true);
  }, [lead, followUp, queryClient]);

  const clearFollowUp = useCallback(() => {
    if (!lead) return;
    setFollowUp('');
    setFollowUpSaved(true);
    updateLeadField(lead.rowIndex, 13, '');
    setTimeout(() => updateLeadField(lead.rowIndex, 13, ''), 2000);
    queryClient.setQueryData<Lead[]>(['leads'], (old) => {
      const updated = (old || []).map((l) =>
        l.rowIndex === lead.rowIndex ? { ...l, seguimiento: '' } : l
      );
      try { localStorage.setItem('qd_cache_leads', JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, [lead, queryClient]);

  const setFollowUpDate = useCallback((date: string) => {
    setFollowUp(date);
    setFollowUpSaved(false);
  }, []);

  const addDays = useCallback((days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    setFollowUpDate(val);
  }, [setFollowUpDate]);

  if (!lead) return null;

  const waNumber = lead.whatsapp ? String(lead.whatsapp).replace(/\D/g, '') : '';
  const waLink = waNumber ? 'https://wa.me/' + waNumber : '';
  const isGanado = lead.stage === 'Cerrado Ganado';
  const avatarColor = getAvatarColor(lead.nombre || String(lead.rowIndex));

  const diasDesdeContacto = (() => {
    try {
      const d = getDaysFromDate(lead.fecha);
      return d >= 0 ? d : null;
    } catch { return null; }
  })();

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4"
      onClick={closeLeadModal}
    >
      <div
        className="bg-white rounded-xl w-full max-w-[1100px] shadow-[0_20px_60px_rgba(0,0,0,0.3)] text-[#2a2a2a] relative max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#eee] shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold shrink-0"
              style={{ background: avatarColor.bg, color: avatarColor.text }}
            >
              {getInitials(lead.nombre || '?')}
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-[#2a2a2a] m-0 leading-tight">{lead.nombre}</h2>
              <div className="text-[11px] text-[#888] mt-0.5">
                {lead.ciudad ? lead.ciudad + ' · ' : ''}
                Lead #{lead.rowIndex}
              </div>
            </div>
          </div>
          <button
            className="bg-transparent border-none text-2xl text-[#999] cursor-pointer px-2 py-1 leading-none hover:text-[#333]"
            onClick={closeLeadModal}
          >
            &times;
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <aside className="w-[340px] shrink-0 border-r border-[#eee] overflow-y-auto px-5 py-4">
            <div className="text-[10px] text-[#888] font-semibold uppercase tracking-wider mb-2">Contacto</div>
            <DataField label="WhatsApp">
              {waLink ? (
                <a href={waLink} target="_blank" rel="noopener noreferrer" className="text-brand no-underline font-semibold hover:underline">{lead.whatsapp}</a>
              ) : (lead.whatsapp || '-')}
            </DataField>
            <EditableField
              label="Ciudad"
              value={lead.ciudad || ''}
              onSave={(v) => saveLeadField(3, v, 'ciudad')}
              placeholder="Sin ciudad"
            />
            <DataField label="Primer contacto">
              {formatDateAR(lead.fecha) || '-'}
              {diasDesdeContacto !== null && (
                <span className="text-[#888] text-[11px] ml-2 font-normal">({diasDesdeContacto === 0 ? 'hoy' : `hace ${diasDesdeContacto}d`})</span>
              )}
            </DataField>

            <div className="text-[10px] text-[#888] font-semibold uppercase tracking-wider mb-2 mt-5">Producto</div>
            <EditableField label="Sistema" value={lead.sistema || ''} onSave={(v) => saveLeadField(9, v, 'sistema')} placeholder="-" />
            <EditableField label="Material" value={lead.material || ''} onSave={(v) => saveLeadField(10, v, 'material')} placeholder="-" />
            <div className="flex flex-col py-1.5">
              <span className="text-[10px] text-[#888] font-semibold uppercase tracking-wider mb-1">Medidas (cm)</span>
              <div className="grid grid-cols-3 gap-2">
                <EditableMedida value={lead.ancho || ''} onSave={(v) => saveLeadField(5, v, 'ancho')} placeholder="Ancho" />
                <EditableMedida value={lead.alto || ''} onSave={(v) => saveLeadField(6, v, 'alto')} placeholder="Alto" />
                <EditableMedida value={lead.boca || ''} onSave={(v) => saveLeadField(7, v, 'boca')} placeholder="Boca" />
              </div>
            </div>
            <EditableField label="Adicionales" value={lead.adicionales || ''} onSave={(v) => saveLeadField(11, v, 'adicionales')} multiline placeholder="-" />
            <EditableField label="Medidas pend." value={lead.medidasPend || ''} onSave={(v) => saveLeadField(12, v, 'medidasPend')} placeholder="-" />

            <div className="text-[10px] text-[#888] font-semibold uppercase tracking-wider mb-2 mt-5">Foto</div>
            {lead.foto ? (
              <a href={lead.foto} target="_blank" rel="noopener noreferrer" className="block group">
                <img
                  src={lead.foto}
                  alt="Foto del cliente"
                  className="w-full max-h-[200px] object-cover rounded-md border border-[#e5e5e5] group-hover:border-brand transition-colors"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <div className="text-[11px] text-brand font-semibold mt-1 hover:underline inline-flex items-center gap-1">Ver completa &#8599;</div>
              </a>
            ) : (
              <div className="text-[12px] text-[#aaa] italic">Sin foto</div>
            )}

            {isGanado && (
              <>
                <div className="text-[10px] text-[#047857] font-semibold uppercase tracking-wider mb-2 mt-5 flex items-center gap-2">
                  Datos de venta
                  {ventaSavedFlag === 'saving' && <span className="text-[9px] text-[#888] normal-case font-normal">guardando…</span>}
                  {ventaSavedFlag === 'saved' && <span className="text-[9px] text-[#047857] normal-case font-normal">✓ guardado</span>}
                </div>
                <div className="bg-[#f8fcf9] border border-[#d1fae5] rounded-lg p-3 space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] font-semibold text-[#666] uppercase tracking-wider mb-1">Fecha cierre</label>
                      <input
                        type="date"
                        value={fechaCierre}
                        onChange={(e) => { setFechaCierre(e.target.value); persistVenta({ fechaCierre: e.target.value }); }}
                        className="w-full bg-white border border-[#ddd] text-[#2a2a2a] py-1 px-1.5 rounded text-[12px] font-sans outline-none focus:border-[#059669]"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-semibold text-[#666] uppercase tracking-wider mb-1">Fecha entrega</label>
                      <input
                        type="date"
                        value={fechaEntrega}
                        onChange={(e) => { setFechaEntrega(e.target.value); persistVenta({ fechaEntrega: e.target.value }); }}
                        className="w-full bg-white border border-[#ddd] text-[#2a2a2a] py-1 px-1.5 rounded text-[12px] font-sans outline-none focus:border-[#059669]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[9px] font-semibold text-[#666] uppercase tracking-wider mb-1">Monto</label>
                    <input
                      type="text"
                      value={monto}
                      onChange={(e) => setMonto(e.target.value)}
                      onBlur={handleMontoBlur}
                      placeholder="$ 0"
                      className="w-full bg-white border border-[#ddd] text-[#2a2a2a] py-1 px-2 rounded text-[13px] font-bold font-sans outline-none focus:border-[#059669]"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-semibold text-[#666] uppercase tracking-wider mb-1">Forma de pago</label>
                    <Select
                      size="sm"
                      value={formaPago}
                      onChange={(v) => { setFormaPago(v); persistVenta({ formaPago: v }); }}
                      placeholder="-- Seleccionar --"
                      options={PAGO_OPTIONS.filter((o) => o).map((opt) => ({ value: opt, label: opt }))}
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-semibold text-[#666] uppercase tracking-wider mb-1">Estado entrega</label>
                    <Select
                      size="sm"
                      value={estadoEntrega}
                      onChange={(v) => { setEstadoEntrega(v); persistVenta({ estadoEntrega: v }); }}
                      options={ENTREGA_OPTIONS.map((opt) => ({ value: opt, label: opt }))}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="text-[10px] text-[#888] font-semibold uppercase tracking-wider mb-2 mt-5">Seguimiento</div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <input
                type="date"
                value={followUp}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="text-[12px] py-1 px-1.5 border border-[#ddd] rounded font-sans outline-none focus:border-brand"
              />
              {followUp && (() => {
                const d = parseGoogleDate(followUp);
                if (!d || isNaN(d.getTime())) return null;
                d.setHours(0, 0, 0, 0);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
                const label = diff === 0 ? 'Hoy' : diff > 0 ? `en ${diff}d` : `hace ${Math.abs(diff)}d`;
                const color = diff < 0 ? 'text-[#dc2626]' : diff === 0 ? 'text-brand' : 'text-[#059669]';
                return <span className={`text-[11px] font-bold ${color}`}>{label}</span>;
              })()}
              {followUp && !followUpSaved && (
                <button onClick={confirmFollowUp} className="bg-brand text-white border-none py-1 px-2 rounded text-[10px] font-bold cursor-pointer hover:bg-brand-hover">Guardar</button>
              )}
              {followUp && followUpSaved && <span className="text-[11px] text-[#059669] font-bold">✓</span>}
              {followUp && (
                <button onClick={clearFollowUp} className="bg-transparent border-none text-[#e55] text-base cursor-pointer px-0.5 leading-none hover:text-[#c33]">&times;</button>
              )}
            </div>
            <div className="flex gap-1 flex-wrap">
              {[3, 7, 15, 30].map((days) => (
                <button
                  key={days}
                  onClick={() => addDays(days)}
                  className="bg-[#f0f2f5] text-[#555] border-none py-0.5 px-2 rounded text-[10px] font-semibold cursor-pointer hover:bg-[#e0e2e5] transition-colors"
                >
                  +{days}d
                </button>
              ))}
            </div>

            <div className="flex gap-2 mt-5 pt-4 border-t border-[#eee]">
              {waLink && (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-3 rounded-md text-[12px] font-bold text-center no-underline text-white bg-[#25D366] hover:bg-[#1ebe57] transition-colors"
                >
                  WhatsApp
                </a>
              )}
              <button
                className="flex-1 py-2.5 px-3 rounded-md border-none cursor-pointer text-[12px] font-bold text-white bg-brand hover:bg-brand-hover transition-colors"
                onClick={() => requestGeneratePresup(lead)}
              >
                Nuevo presupuesto
              </button>
            </div>
          </aside>

          <section className="flex-1 flex flex-col overflow-hidden">
            <div className="px-5 py-3 border-b border-[#eee]">
              <StageTracker
                stages={stages}
                currentStage={lead.stage || 'Nuevo Lead'}
              />
            </div>

            <div className="flex items-center gap-1 px-5 pt-3 border-b border-[#eee]">
              {([
                { id: 'actividad', label: 'Actividad' },
                { id: 'presupuestos', label: 'Presupuestos' },
                { id: 'notas', label: 'Notas' },
                { id: 'mensajes', label: 'Mensajes' },
              ] as { id: TabId; label: string }[]).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`px-3 py-2 text-[12px] font-semibold border-b-2 transition-colors cursor-pointer bg-transparent ${
                    tab === t.id
                      ? 'border-brand text-brand'
                      : 'border-transparent text-[#888] hover:text-[#444]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {tab === 'actividad' && <ActivityTimeline events={activityEvents} />}
              {tab === 'presupuestos' && <BudgetHistorySection clienteKey={ventaKey} />}
              {tab === 'notas' && <NotesSection lead={lead} />}
              {tab === 'mensajes' && <MessageTemplatesSection lead={lead} />}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
