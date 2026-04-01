import type { Lead, PipelineStage } from '../../types';
import { formatDateAR } from '../../lib/dates';

interface Props {
  leads: Lead[];
  sortCol: keyof Lead;
  sortDir: 'asc' | 'desc';
  onSort: (col: keyof Lead) => void;
  selectedIds: Set<number>;
  onToggle: (id: number) => void;
  onToggleAll: (ids: number[]) => void;
  onOpenModal: (lead: Lead) => void;
  onEstadoChange: (lead: Lead, newStage: string) => void;
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
  stages: PipelineStage[];
}

function SortIndicator({ col, sortCol, sortDir }: { col: keyof Lead; sortCol: keyof Lead; sortDir: string }) {
  if (col !== sortCol) return null;
  return <span className="text-[10px] ml-1 text-brand">{sortDir === 'asc' ? '\u25B2' : '\u25BC'}</span>;
}

export default function ContactosTable({
  leads,
  sortCol,
  sortDir,
  onSort,
  selectedIds,
  onToggle,
  onToggleAll,
  onOpenModal,
  onEstadoChange,
  onEdit,
  onDelete,
  stages,
}: Props) {
  const allIds = leads.map((l) => l.rowIndex);
  const allChecked = leads.length > 0 && selectedIds.size === leads.length;

  const handleRowClick = (e: React.MouseEvent, lead: Lead) => {
    const tag = (e.target as HTMLElement).tagName;
    const cl = (e.target as HTMLElement).className || '';
    if (tag === 'SELECT' || tag === 'A' || tag === 'INPUT' || tag === 'BUTTON' || tag === 'OPTION') return;
    if (typeof cl === 'string' && (cl.includes('btn-delete') || cl.includes('btn-edit'))) return;
    onOpenModal(lead);
  };

  return (
    <div className="flex-1 overflow-auto bg-white rounded-[10px] shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="sticky top-0 bg-[#fafafa] py-2.5 px-3.5 text-left text-[11px] font-bold text-[#888] uppercase tracking-[0.5px] border-b-2 border-[#eee] z-[1] w-[30px]">
              <input
                type="checkbox"
                checked={allChecked}
                onChange={() => onToggleAll(allIds)}
                className="cursor-pointer"
              />
            </th>
            {([
              { key: 'nombre' as keyof Lead, label: 'Nombre', sortable: true },
              { key: 'whatsapp' as keyof Lead, label: 'WhatsApp', sortable: false },
              { key: 'ciudad' as keyof Lead, label: 'Ciudad', sortable: true },
              { key: 'fecha' as keyof Lead, label: 'Fecha', sortable: true },
              { key: 'estado' as keyof Lead, label: 'Estado', sortable: true },
              { key: 'sistema' as keyof Lead, label: 'Sistema', sortable: false },
              { key: 'material' as keyof Lead, label: 'Material', sortable: false },
            ]).map((col) => (
              <th
                key={col.key}
                className={`sticky top-0 bg-[#fafafa] py-2.5 px-3.5 text-left text-[11px] font-bold text-[#888] uppercase tracking-[0.5px] border-b-2 border-[#eee] z-[1] ${col.sortable ? 'cursor-pointer select-none hover:text-brand' : ''}`}
                onClick={col.sortable ? () => onSort(col.key) : undefined}
              >
                {col.label}
                {col.sortable && <SortIndicator col={col.key} sortCol={sortCol} sortDir={sortDir} />}
              </th>
            ))}
            <th className="sticky top-0 bg-[#fafafa] py-2.5 px-3.5 text-left text-[11px] font-bold text-[#888] uppercase tracking-[0.5px] border-b-2 border-[#eee] z-[1]">Medidas</th>
            <th className="sticky top-0 bg-[#fafafa] py-2.5 px-3.5 text-left text-[11px] font-bold text-[#888] uppercase tracking-[0.5px] border-b-2 border-[#eee] z-[1]">Adicionales</th>
            <th className="sticky top-0 bg-[#fafafa] py-2.5 px-3.5 text-left text-[11px] font-bold text-[#888] uppercase tracking-[0.5px] border-b-2 border-[#eee] z-[1] w-[40px]" />
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => {
            const waNumber = lead.whatsapp ? String(lead.whatsapp).replace(/\D/g, '') : '';
            const waLink = waNumber ? `https://wa.me/${waNumber}` : '';
            const medidas = lead.hasMeasures ? `${lead.ancho} x ${lead.alto} cm` : '-';

            return (
              <tr
                key={lead.rowIndex}
                className="cursor-pointer transition-colors duration-150 hover:bg-[#f0f7ff] even:bg-[#fafafa] even:hover:bg-[#f0f7ff]"
                onClick={(e) => handleRowClick(e, lead)}
              >
                <td className="py-2.5 px-3.5 border-b border-[#f0f0f0] text-[#2a2a2a] align-middle">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(lead.rowIndex)}
                    onChange={() => onToggle(lead.rowIndex)}
                    className="cursor-pointer"
                  />
                </td>
                <td className="py-2.5 px-3.5 border-b border-[#f0f0f0] text-[#2a2a2a] align-middle font-bold">
                  {lead.nombre}
                </td>
                <td className="py-2.5 px-3.5 border-b border-[#f0f0f0] text-[#2a2a2a] align-middle">
                  {waLink ? (
                    <a href={waLink} target="_blank" rel="noopener noreferrer" className="text-brand font-semibold no-underline hover:underline">
                      {waNumber || '-'}
                    </a>
                  ) : (
                    '-'
                  )}
                </td>
                <td className="py-2.5 px-3.5 border-b border-[#f0f0f0] text-[#2a2a2a] align-middle">
                  {lead.ciudad || '-'}
                </td>
                <td className="py-2.5 px-3.5 border-b border-[#f0f0f0] text-[#2a2a2a] align-middle">
                  {formatDateAR(lead.fecha) || '-'}
                </td>
                <td className="py-2.5 px-3.5 border-b border-[#f0f0f0] text-[#2a2a2a] align-middle">
                  <select
                    className="py-[3px] px-2 border border-[#ddd] rounded-md text-xs font-sans bg-white cursor-pointer outline-none font-semibold focus:border-brand"
                    value={lead.stage || 'Nuevo Lead'}
                    onChange={(e) => {
                      e.stopPropagation();
                      onEstadoChange(lead, e.target.value);
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {stages.map((s) => (
                      <option key={s.name} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-2.5 px-3.5 border-b border-[#f0f0f0] text-[#2a2a2a] align-middle">
                  {lead.sistema || '-'}
                </td>
                <td className="py-2.5 px-3.5 border-b border-[#f0f0f0] text-[#2a2a2a] align-middle">
                  {lead.material || '-'}
                </td>
                <td className="py-2.5 px-3.5 border-b border-[#f0f0f0] text-[#2a2a2a] align-middle">
                  {medidas}
                </td>
                <td className="py-2.5 px-3.5 border-b border-[#f0f0f0] text-[#2a2a2a] align-middle">
                  {lead.adicionales || '-'}
                </td>
                <td className="py-2.5 px-3.5 border-b border-[#f0f0f0] text-[#2a2a2a] align-middle text-center whitespace-nowrap">
                  <button
                    className="btn-edit bg-none border-none text-brand text-base cursor-pointer py-0.5 px-1.5 rounded leading-none opacity-50 transition-opacity duration-200 hover:opacity-100 hover:bg-brand/10 mr-1"
                    title="Editar contacto"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(lead);
                    }}
                  >
                    &#9998;
                  </button>
                  <button
                    className="btn-delete bg-none border-none text-danger text-xl cursor-pointer py-0.5 px-1.5 rounded leading-none opacity-50 transition-opacity duration-200 hover:opacity-100 hover:bg-danger/10"
                    title="Eliminar contacto"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(lead);
                    }}
                  >
                    &times;
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
