import { useRef, useCallback, useContext } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import type { Lead, VentaStore } from '../../types';
import { parseGoogleDate } from '../../lib/dates';
import { formatPrice, parsePriceInput } from '../../lib/formatters';
import { ModalContext } from '../../contexts/ModalContext';
import { Select } from '../ui/select';

function toISODate(raw: string | null | undefined): string {
  if (!raw) return '';
  const d = parseGoogleDate(raw);
  if (!d || isNaN(d.getTime())) return '';
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function InlineDate({ value, onSave }: { value: string; onSave: (val: string) => void }) {
  return (
    <input
      type="date"
      defaultValue={toISODate(value)}
      onChange={(e) => onSave(e.target.value)}
      className="bg-white border border-[#ddd] py-1 px-2 text-[12px] font-sans text-[#2a2a2a] rounded hover:border-[#bbb] focus:border-brand outline-none transition-all"
    />
  );
}

interface Props {
  ganados: Lead[];
  ventasStore: Record<string, VentaStore>;
  selectedIds: Set<number>;
  onToggle: (id: number) => void;
  onToggleAll: (ids: number[]) => void;
  onOpenModal: (lead: Lead) => void;
  onEdit: (key: string) => void;
  onDelete: (lead: Lead) => void;
  onSaveField: (key: string, field: keyof VentaStore, value: string | number) => void;
}

const PAGO_OPTIONS = ['', '100% anticipado', '50/50', '3 cuotas', 'Otro'];
const ENTREGA_OPTIONS = ['', 'Pendiente fabricacion', 'En fabricacion', 'Listo para entregar', 'Entregado e instalado'];

function getVentaKey(lead: Lead): string {
  return (lead.nombre || '') + '|' + (lead.whatsapp || '');
}

function getMedidas(lead: Lead): string {
  const parts: string[] = [];
  if (lead.ancho && lead.ancho !== '-' && lead.ancho !== '--') parts.push(lead.ancho);
  if (lead.alto && lead.alto !== '-' && lead.alto !== '--') parts.push(lead.alto);
  if (lead.boca && lead.boca !== '-' && lead.boca !== '--') parts.push(lead.boca);
  return parts.length > 0 ? parts.join('×') : '-';
}

function InlineInput({
  value,
  placeholder,
  width,
  onSave,
  isMonto,
}: {
  value: string;
  placeholder: string;
  width: string;
  onSave: (val: string) => void;
  isMonto?: boolean;
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleBlur = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const raw = inputRef.current?.value || '';
    if (isMonto) {
      const num = parsePriceInput(raw);
      if (inputRef.current) inputRef.current.value = num > 0 ? formatPrice(num) : '';
      onSave(String(num));
    } else {
      onSave(raw);
    }
  }, [onSave, isMonto]);

  const handleFocus = useCallback(() => {
    if (isMonto && inputRef.current) {
      const num = parsePriceInput(inputRef.current.value);
      inputRef.current.value = num > 0 ? String(num) : '';
    }
  }, [isMonto]);

  const handleChange = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const raw = inputRef.current?.value || '';
      if (isMonto) {
        onSave(String(parsePriceInput(raw)));
      } else {
        onSave(raw);
      }
    }, 800);
  }, [onSave, isMonto]);

  return (
    <input
      ref={inputRef}
      type="text"
      defaultValue={isMonto && parsePriceInput(value) > 0 ? formatPrice(parsePriceInput(value)) : value}
      placeholder={placeholder}
      onBlur={handleBlur}
      onFocus={handleFocus}
      onChange={handleChange}
      style={{ width }}
      className="bg-white border border-[#ddd] py-1 px-2 text-[13px] font-sans text-[#2a2a2a] rounded hover:border-[#bbb] focus:border-brand outline-none transition-all"
    />
  );
}

function InlineSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (val: string) => void;
}) {
  return (
    <Select
      size="sm"
      value={value}
      onChange={onChange}
      placeholder="-- Seleccionar --"
      options={options.filter((o) => o).map((opt) => ({ value: opt, label: opt }))}
    />
  );
}

export default function VentasTable({
  ganados,
  ventasStore,
  selectedIds,
  onToggle,
  onToggleAll,
  onOpenModal: _onOpenModal,
  onEdit,
  onDelete,
  onSaveField,
}: Props) {
  const { openLeadModal } = useContext(ModalContext);
  const allIds = ganados.map((l) => l.rowIndex);
  const allChecked = ganados.length > 0 && selectedIds.size === ganados.length;

  return (
    <div className="flex-1 overflow-auto bg-white rounded-xl border border-border shadow-[var(--shadow-card)]">
      <table className="w-full border-collapse text-[13px] table-fixed">
        <thead>
          <tr>
            <th className="sticky top-0 bg-white py-3 px-3 text-left text-[10px] font-bold text-[#888] uppercase tracking-[0.8px] border-b border-[#eee] z-10 w-[36px]">
              <input
                type="checkbox"
                checked={allChecked}
                onChange={() => onToggleAll(allIds)}
                className="cursor-pointer"
              />
            </th>
            <th className="sticky top-0 bg-white py-3 px-3 text-left text-[10px] font-bold text-[#888] uppercase tracking-[0.8px] border-b border-[#eee] z-10 whitespace-nowrap w-[160px]">Cliente</th>
            <th className="sticky top-0 bg-white py-3 px-3 text-left text-[10px] font-bold text-[#888] uppercase tracking-[0.8px] border-b border-[#eee] z-10 whitespace-nowrap w-[110px]">Ciudad</th>
            <th className="sticky top-0 bg-white py-3 px-3 text-left text-[10px] font-bold text-[#888] uppercase tracking-[0.8px] border-b border-[#eee] z-10 whitespace-nowrap w-[155px]">
              Fecha cierre
              <span className="ml-1.5 bg-[#ef4444] text-white text-[8px] font-black px-1 py-0.5 rounded leading-none tracking-wider align-middle">NUEVO</span>
            </th>
            <th className="sticky top-0 bg-white py-3 px-3 text-left text-[10px] font-bold text-[#888] uppercase tracking-[0.8px] border-b border-[#eee] z-10 whitespace-nowrap w-[155px]">
              Fecha entrega
              <span className="ml-1.5 bg-[#ef4444] text-white text-[8px] font-black px-1 py-0.5 rounded leading-none tracking-wider align-middle">NUEVO</span>
            </th>
            <th className="sticky top-0 bg-white py-3 px-3 text-left text-[10px] font-bold text-[#888] uppercase tracking-[0.8px] border-b border-[#eee] z-10 whitespace-nowrap w-[110px]">Sistema</th>
            <th className="sticky top-0 bg-white py-3 px-3 text-left text-[10px] font-bold text-[#888] uppercase tracking-[0.8px] border-b border-[#eee] z-10 whitespace-nowrap w-[110px]">Material</th>
            <th className="sticky top-0 bg-white py-3 px-3 text-left text-[10px] font-bold text-[#888] uppercase tracking-[0.8px] border-b border-[#eee] z-10 whitespace-nowrap w-[110px]">Medidas</th>
            <th className="sticky top-0 bg-white py-3 px-3 text-left text-[10px] font-bold text-[#888] uppercase tracking-[0.8px] border-b border-[#eee] z-10 whitespace-nowrap w-[150px]">Monto</th>
            <th className="sticky top-0 bg-white py-3 px-3 text-left text-[10px] font-bold text-[#888] uppercase tracking-[0.8px] border-b border-[#eee] z-10 whitespace-nowrap w-[150px]">Forma pago</th>
            <th className="sticky top-0 bg-white py-3 px-3 text-left text-[10px] font-bold text-[#888] uppercase tracking-[0.8px] border-b border-[#eee] z-10 whitespace-nowrap w-[180px]">Estado entrega</th>
            <th className="sticky top-0 bg-white py-3 px-3 text-left text-[10px] font-bold text-[#888] uppercase tracking-[0.8px] border-b border-[#eee] z-10 whitespace-nowrap w-[160px]">Notas</th>
            <th className="sticky top-0 bg-white py-3 px-3 text-left text-[10px] font-bold text-[#888] uppercase tracking-[0.8px] border-b border-[#eee] z-10 whitespace-nowrap w-[90px]">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ganados.map((lead) => {
            const key = getVentaKey(lead);
            const vdata = ventasStore[key] || ({} as VentaStore);
            return (
              <tr
                key={lead.rowIndex}
                className="h-[56px] transition-colors hover:bg-[#f8fafc]"
              >
                <td className="py-3 px-3 border-b border-[#f0f0f0] align-middle">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(lead.rowIndex)}
                    onChange={() => onToggle(lead.rowIndex)}
                    className="cursor-pointer"
                  />
                </td>
                <td className="py-3 px-3 border-b border-[#f0f0f0] align-middle font-bold whitespace-nowrap">
                  <button
                    onClick={() => openLeadModal(lead)}
                    className="text-brand hover:underline cursor-pointer bg-transparent border-none font-bold text-[13px] font-sans p-0 truncate max-w-full block text-left"
                  >
                    {lead.nombre}
                  </button>
                </td>
                <td className="py-3 px-3 border-b border-[#f0f0f0] align-middle text-text-muted whitespace-nowrap truncate">
                  {lead.ciudad || '-'}
                </td>
                <td className="py-3 px-3 border-b border-[#f0f0f0] align-middle">
                  <InlineDate
                    value={vdata.fechaCierre || lead.fecha || ''}
                    onSave={(val) => onSaveField(key, 'fechaCierre', val)}
                  />
                </td>
                <td className="py-3 px-3 border-b border-[#f0f0f0] align-middle">
                  <InlineDate
                    value={vdata.fechaEntrega || ''}
                    onSave={(val) => onSaveField(key, 'fechaEntrega', val)}
                  />
                </td>
                <td className="py-3 px-3 border-b border-[#f0f0f0] align-middle text-text-muted whitespace-nowrap truncate">
                  {lead.sistema || '-'}
                </td>
                <td className="py-3 px-3 border-b border-[#f0f0f0] align-middle text-text-muted whitespace-nowrap truncate">
                  {lead.material || '-'}
                </td>
                <td className="py-3 px-3 border-b border-[#f0f0f0] align-middle text-text-muted whitespace-nowrap truncate text-[12px]">
                  {getMedidas(lead)}
                </td>
                <td className="py-3 px-3 border-b border-[#f0f0f0] align-middle">
                  <InlineInput
                    value={String(vdata.monto || 0)}
                    placeholder="$ 0"
                    width="130px"
                    isMonto
                    onSave={(val) => onSaveField(key, 'monto', Number(val))}
                  />
                </td>
                <td className="py-3 px-3 border-b border-[#f0f0f0] align-middle">
                  <InlineSelect
                    value={vdata.formaPago || ''}
                    options={PAGO_OPTIONS}
                    onChange={(val) => onSaveField(key, 'formaPago', val)}
                  />
                </td>
                <td className="py-3 px-3 border-b border-[#f0f0f0] align-middle">
                  <InlineSelect
                    value={vdata.estadoEntrega || ''}
                    options={ENTREGA_OPTIONS}
                    onChange={(val) => onSaveField(key, 'estadoEntrega', val)}
                  />
                </td>
                <td className="py-3 px-3 border-b border-[#f0f0f0] align-middle">
                  <InlineInput
                    value={vdata.notas || ''}
                    placeholder="Agregar nota..."
                    width="160px"
                    onSave={(val) => onSaveField(key, 'notas', val)}
                  />
                </td>
                <td className="py-3 px-3 border-b border-[#f0f0f0] align-middle whitespace-nowrap">
                  <button
                    onClick={() => onEdit(key)}
                    title="Editar venta"
                    className="bg-transparent border border-border text-text-muted rounded-md w-7 h-7 inline-flex items-center justify-center cursor-pointer hover:border-brand hover:text-brand hover:bg-brand-soft transition-colors mr-1"
                  >
                    <Pencil size={12} strokeWidth={2} />
                  </button>
                  <button
                    onClick={() => onDelete(lead)}
                    title="Eliminar venta"
                    className="bg-transparent border border-border text-text-muted rounded-md w-7 h-7 inline-flex items-center justify-center cursor-pointer hover:border-danger hover:text-danger hover:bg-danger-soft transition-colors"
                  >
                    <Trash2 size={12} strokeWidth={2} />
                  </button>
                </td>
              </tr>
            );
          })}
          {ganados.length === 0 && (
            <tr>
              <td colSpan={13} className="py-10 px-3 text-center text-[#888] text-sm">
                No hay ventas en el periodo seleccionado
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
