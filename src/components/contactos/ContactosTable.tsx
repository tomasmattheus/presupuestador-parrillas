import type { Lead, PipelineStage } from '../../types';
import { formatDateAR } from '../../lib/dates';
import { getInitials, getAvatarColor } from '../../lib/avatar';
import { Select } from '../ui/select';

const STAGE_PILL_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Nuevo Lead': { bg: '#e8f5fd', text: '#0d6fb3', border: '#bce0f7' },
  'Presupuesto Enviado': { bg: '#fef3e2', text: '#92400e', border: '#fcd9a8' },
  'En Seguimiento': { bg: '#f3e8ff', text: '#6b21a8', border: '#e1c8f5' },
  'Cerrado Ganado': { bg: '#d1fae5', text: '#047857', border: '#a7f3d0' },
  'Cerrado Perdido': { bg: '#fee2e2', text: '#b91c1c', border: '#fca5a5' },
};

function getStagePillColor(stage: string) {
  return STAGE_PILL_COLORS[stage] || { bg: '#f0f0f0', text: '#555', border: '#ddd' };
}

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
    <div className="flex-1 overflow-auto bg-white rounded-xl border border-border shadow-[var(--shadow-card)]">
      <table className="w-full border-collapse text-sm table-fixed">
        <thead>
          <tr>
            <th className="sticky top-0 bg-white py-3 px-3.5 text-left text-[10px] font-bold text-[#888] uppercase tracking-[0.8px] border-b border-[#eee] z-[1] w-[30px]">
              <input
                type="checkbox"
                checked={allChecked}
                onChange={() => onToggleAll(allIds)}
                className="cursor-pointer"
              />
            </th>
            {([
              { key: 'nombre' as keyof Lead, label: 'Nombre', sortable: true, width: '' },
              { key: 'whatsapp' as keyof Lead, label: 'WhatsApp', sortable: false, width: 'w-[140px]' },
              { key: 'ciudad' as keyof Lead, label: 'Ciudad', sortable: true, width: 'w-[120px]' },
              { key: 'fecha' as keyof Lead, label: 'Fecha', sortable: true, width: 'w-[110px]' },
              { key: 'estado' as keyof Lead, label: 'Estado', sortable: true, width: 'w-[150px]' },
              { key: 'sistema' as keyof Lead, label: 'Sistema', sortable: false, width: 'w-[120px]' },
              { key: 'material' as keyof Lead, label: 'Material', sortable: false, width: 'w-[130px]' },
            ]).map((col) => (
              <th
                key={col.key}
                className={`sticky top-0 bg-white py-3 px-3.5 text-left text-[10px] font-bold text-[#888] uppercase tracking-[0.8px] border-b border-[#eee] z-[1] ${col.width} ${col.sortable ? 'cursor-pointer select-none hover:text-brand' : ''}`}
                onClick={col.sortable ? () => onSort(col.key) : undefined}
              >
                {col.label}
                {col.sortable && <SortIndicator col={col.key} sortCol={sortCol} sortDir={sortDir} />}
              </th>
            ))}
            <th className="sticky top-0 bg-white py-3 px-3.5 text-left text-[10px] font-bold text-[#888] uppercase tracking-[0.8px] border-b border-[#eee] z-[1] w-[110px]">Medidas</th>
            <th className="sticky top-0 bg-white py-3 px-3.5 text-left text-[10px] font-bold text-[#888] uppercase tracking-[0.8px] border-b border-[#eee] z-[1]">Adicionales</th>
            <th className="sticky top-0 bg-white py-3 px-3.5 text-left text-[10px] font-bold text-[#888] uppercase tracking-[0.8px] border-b border-[#eee] z-[1] w-[80px]" />
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
                className="h-[56px] cursor-pointer transition-colors duration-150 hover:bg-[#f8fafc]"
                onClick={(e) => handleRowClick(e, lead)}
              >
                <td className="py-3 px-3.5 border-b border-[#f0f0f0] text-[#444] align-middle whitespace-nowrap text-[13px]">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(lead.rowIndex)}
                    onChange={() => onToggle(lead.rowIndex)}
                    className="cursor-pointer"
                  />
                </td>
                <td className="py-3 px-3.5 border-b border-[#f0f0f0] text-[#2a2a2a] align-middle whitespace-nowrap text-[13px] font-semibold">
                  {(() => {
                    const color = getAvatarColor(lead.nombre || String(lead.rowIndex));
                    return (
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                          style={{ background: color.bg, color: color.text }}
                        >
                          {getInitials(lead.nombre || '?')}
                        </div>
                        <span>{lead.nombre || '-'}</span>
                      </div>
                    );
                  })()}
                </td>
                <td className="py-3 px-3.5 border-b border-[#f0f0f0] text-[#444] align-middle whitespace-nowrap text-[13px]">
                  {waLink ? (
                    <a href={waLink} target="_blank" rel="noopener noreferrer" className="text-brand font-semibold no-underline hover:underline">
                      {waNumber || '-'}
                    </a>
                  ) : (
                    '-'
                  )}
                </td>
                <td className="py-3 px-3.5 border-b border-[#f0f0f0] text-[#444] align-middle whitespace-nowrap text-[13px]">
                  {lead.ciudad || '-'}
                </td>
                <td className="py-3 px-3.5 border-b border-[#f0f0f0] text-[#444] align-middle whitespace-nowrap text-[13px]">
                  {formatDateAR(lead.fecha) || '-'}
                </td>
                <td className="py-3 px-3.5 border-b border-[#f0f0f0] align-middle whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  {(() => {
                    const stage = lead.stage || 'Nuevo Lead';
                    const c = getStagePillColor(stage);
                    return (
                      <Select
                        size="pill"
                        value={stage}
                        onChange={(v) => onEstadoChange(lead, v)}
                        options={stages.map((s) => ({ value: s.name, label: s.name }))}
                        triggerStyle={{
                          backgroundColor: c.bg,
                          color: c.text,
                          borderColor: c.border,
                          borderWidth: 1,
                          borderStyle: 'solid',
                        }}
                        triggerClassName="inline-flex"
                      />
                    );
                  })()}
                </td>
                <td className="py-3 px-3.5 border-b border-[#f0f0f0] text-[#444] align-middle whitespace-nowrap text-[13px]">
                  {lead.sistema || '-'}
                </td>
                <td className="py-3 px-3.5 border-b border-[#f0f0f0] text-[#444] align-middle whitespace-nowrap text-[13px]">
                  {lead.material || '-'}
                </td>
                <td className="py-3 px-3.5 border-b border-[#f0f0f0] text-[#444] align-middle whitespace-nowrap text-[13px]">
                  {medidas}
                </td>
                <td className="py-3 px-3.5 border-b border-[#f0f0f0] text-[#444] align-middle whitespace-nowrap text-[13px]">
                  {lead.adicionales || '-'}
                </td>
                <td className="py-3 px-3.5 border-b border-[#f0f0f0] align-middle text-center whitespace-nowrap">
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
