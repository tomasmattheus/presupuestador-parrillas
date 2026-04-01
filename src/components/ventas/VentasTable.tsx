import { useRef, useCallback, useContext } from 'react';
import type { Lead, VentaStore } from '../../types';
import { formatDateAR } from '../../lib/dates';
import { formatPrice, parsePriceInput } from '../../lib/formatters';
import { ModalContext } from '../../contexts/ModalContext';

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
  if (lead.ancho && lead.ancho !== '-' && lead.ancho !== '--') parts.push('A: ' + lead.ancho);
  if (lead.alto && lead.alto !== '-' && lead.alto !== '--') parts.push('H: ' + lead.alto);
  if (lead.boca && lead.boca !== '-' && lead.boca !== '--') parts.push('B: ' + lead.boca);
  return parts.length > 0 ? parts.join(' | ') : '-';
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
    <select
      defaultValue={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-white border border-[#ddd] py-1 px-1.5 text-xs font-sans text-[#2a2a2a] rounded cursor-pointer hover:border-[#bbb] focus:border-brand outline-none transition-all"
    >
      {options.map((opt) => (
        <option key={opt} value={opt} className="bg-white text-[#2a2a2a]">
          {opt || '-- Seleccionar --'}
        </option>
      ))}
    </select>
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
    <div className="flex-1 overflow-auto bg-white rounded-[10px] shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr>
            <th className="sticky top-0 bg-[#fafafa] py-2.5 px-3 text-left text-[11px] font-bold text-[#888] uppercase tracking-wide border-b-2 border-[#eee] z-10 w-[30px]">
              <input
                type="checkbox"
                checked={allChecked}
                onChange={() => onToggleAll(allIds)}
                className="cursor-pointer"
              />
            </th>
            <th className="sticky top-0 bg-[#fafafa] py-2.5 px-3 text-left text-[11px] font-bold text-[#888] uppercase tracking-wide border-b-2 border-[#eee] z-10 whitespace-nowrap">Cliente</th>
            <th className="sticky top-0 bg-[#fafafa] py-2.5 px-3 text-left text-[11px] font-bold text-[#888] uppercase tracking-wide border-b-2 border-[#eee] z-10 whitespace-nowrap">Ciudad</th>
            <th className="sticky top-0 bg-[#fafafa] py-2.5 px-3 text-left text-[11px] font-bold text-[#888] uppercase tracking-wide border-b-2 border-[#eee] z-10 whitespace-nowrap">Fecha cierre</th>
            <th className="sticky top-0 bg-[#fafafa] py-2.5 px-3 text-left text-[11px] font-bold text-[#888] uppercase tracking-wide border-b-2 border-[#eee] z-10 whitespace-nowrap">Sistema</th>
            <th className="sticky top-0 bg-[#fafafa] py-2.5 px-3 text-left text-[11px] font-bold text-[#888] uppercase tracking-wide border-b-2 border-[#eee] z-10 whitespace-nowrap">Material</th>
            <th className="sticky top-0 bg-[#fafafa] py-2.5 px-3 text-left text-[11px] font-bold text-[#888] uppercase tracking-wide border-b-2 border-[#eee] z-10 whitespace-nowrap">Medidas</th>
            <th className="sticky top-0 bg-[#fafafa] py-2.5 px-3 text-left text-[11px] font-bold text-[#888] uppercase tracking-wide border-b-2 border-[#eee] z-10 whitespace-nowrap">Monto</th>
            <th className="sticky top-0 bg-[#fafafa] py-2.5 px-3 text-left text-[11px] font-bold text-[#888] uppercase tracking-wide border-b-2 border-[#eee] z-10 whitespace-nowrap">Forma pago</th>
            <th className="sticky top-0 bg-[#fafafa] py-2.5 px-3 text-left text-[11px] font-bold text-[#888] uppercase tracking-wide border-b-2 border-[#eee] z-10 whitespace-nowrap">Estado entrega</th>
            <th className="sticky top-0 bg-[#fafafa] py-2.5 px-3 text-left text-[11px] font-bold text-[#888] uppercase tracking-wide border-b-2 border-[#eee] z-10 whitespace-nowrap">Notas</th>
            <th className="sticky top-0 bg-[#fafafa] py-2.5 px-3 text-left text-[11px] font-bold text-[#888] uppercase tracking-wide border-b-2 border-[#eee] z-10 whitespace-nowrap">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ganados.map((lead) => {
            const key = getVentaKey(lead);
            const vdata = ventasStore[key] || ({} as VentaStore);
            return (
              <tr
                key={lead.rowIndex}
                className="transition-colors hover:bg-[#f0f7ff] even:bg-[#fafafa] even:hover:bg-[#f0f7ff]"
              >
                <td className="py-2 px-3 border-b border-[#eee] align-middle">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(lead.rowIndex)}
                    onChange={() => onToggle(lead.rowIndex)}
                    className="cursor-pointer"
                  />
                </td>
                <td className="py-2 px-3 border-b border-[#eee] align-middle font-bold">
                  <button
                    onClick={() => openLeadModal(lead)}
                    className="text-brand hover:underline cursor-pointer bg-transparent border-none font-bold text-[13px] font-sans p-0"
                  >
                    {lead.nombre}
                  </button>
                </td>
                <td className="py-2 px-3 border-b border-[#eee] align-middle text-[#888]">
                  {lead.ciudad || '-'}
                </td>
                <td className="py-2 px-3 border-b border-[#eee] align-middle text-[#888]">
                  {formatDateAR(lead.fecha) || '-'}
                </td>
                <td className="py-2 px-3 border-b border-[#eee] align-middle text-[#888]">
                  {lead.sistema || '-'}
                </td>
                <td className="py-2 px-3 border-b border-[#eee] align-middle text-[#888]">
                  {lead.material || '-'}
                </td>
                <td className="py-2 px-3 border-b border-[#eee] align-middle text-[#888]">
                  {getMedidas(lead)}
                </td>
                <td className="py-2 px-3 border-b border-[#eee] align-middle">
                  <InlineInput
                    value={String(vdata.monto || 0)}
                    placeholder="$ 0"
                    width="130px"
                    isMonto
                    onSave={(val) => onSaveField(key, 'monto', Number(val))}
                  />
                </td>
                <td className="py-2 px-3 border-b border-[#eee] align-middle">
                  <InlineSelect
                    value={vdata.formaPago || ''}
                    options={PAGO_OPTIONS}
                    onChange={(val) => onSaveField(key, 'formaPago', val)}
                  />
                </td>
                <td className="py-2 px-3 border-b border-[#eee] align-middle">
                  <InlineSelect
                    value={vdata.estadoEntrega || ''}
                    options={ENTREGA_OPTIONS}
                    onChange={(val) => onSaveField(key, 'estadoEntrega', val)}
                  />
                </td>
                <td className="py-2 px-3 border-b border-[#eee] align-middle">
                  <InlineInput
                    value={vdata.notas || ''}
                    placeholder="Agregar nota..."
                    width="160px"
                    onSave={(val) => onSaveField(key, 'notas', val)}
                  />
                </td>
                <td className="py-2 px-3 border-b border-[#eee] align-middle whitespace-nowrap">
                  <button
                    onClick={() => onEdit(key)}
                    title="Editar venta"
                    className="bg-transparent border border-[#ddd] text-[#888] rounded w-7 h-7 text-sm cursor-pointer hover:border-brand hover:text-brand transition-colors mr-1"
                  >
                    &#9998;
                  </button>
                  <button
                    onClick={() => onDelete(lead)}
                    title="Eliminar venta"
                    className="bg-transparent border border-[#ddd] text-[#888] rounded w-7 h-7 text-sm cursor-pointer hover:border-danger hover:text-danger transition-colors"
                  >
                    &#10007;
                  </button>
                </td>
              </tr>
            );
          })}
          {ganados.length === 0 && (
            <tr>
              <td colSpan={12} className="py-10 px-3 text-center text-[#888] text-sm">
                No hay ventas en el periodo seleccionado
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
