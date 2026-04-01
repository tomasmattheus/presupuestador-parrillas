import { useContext } from 'react';
import { ModalContext } from '../../contexts/ModalContext';
import { getEstadoBadgeClass } from '../../lib/mappers';
import { formatDateAR } from '../../lib/dates';
import BudgetHistorySection from './BudgetHistorySection';
import NotesSection from './NotesSection';
import MessageTemplatesSection from './MessageTemplatesSection';

const BADGE_COLORS: Record<string, string> = {
  'estado-nuevo-lead': 'bg-[#e8f5fd] text-[#1DA1F2]',
  'estado-presupuesto-enviado': 'bg-[#fef3e2] text-[#b45309]',
  'estado-en-seguimiento': 'bg-[#f3e8ff] text-[#7c3aed]',
  'estado-cerrado-ganado': 'bg-[#d1fae5] text-[#059669]',
  'estado-cerrado-perdido': 'bg-[#fee2e2] text-[#dc2626]',
};

export default function LeadDetailModal() {
  const { leadModalLead: lead, closeLeadModal, requestGeneratePresup } = useContext(ModalContext);

  if (!lead) return null;

  const waNumber = lead.whatsapp ? lead.whatsapp.toString().replace(/\D/g, '') : '';
  const waLink = waNumber ? 'https://wa.me/' + waNumber : '';
  const budgetKey = (lead.nombre || '') + '|' + (lead.whatsapp || '');
  const badgeClass = getEstadoBadgeClass(lead.stage);
  const badgeColor = BADGE_COLORS[badgeClass] || BADGE_COLORS['estado-nuevo-lead'];

  const rows: [string, React.ReactNode][] = [
    ['Ciudad', lead.ciudad || '-'],
    ['WhatsApp', waLink
      ? <a href={waLink} target="_blank" rel="noopener noreferrer" className="text-[#1DA1F2] no-underline font-semibold hover:underline">{lead.whatsapp}</a>
      : (lead.whatsapp || '-')],
    ['Fecha', formatDateAR(lead.fecha) || '-'],
    ['Estado', <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${badgeColor}`}>{lead.stage}</span>],
    ['Sistema', lead.sistema || '-'],
    ['Material', lead.material || '-'],
    ['Ancho total', lead.ancho ? lead.ancho + ' cm' : '-'],
    ['Alto total', lead.alto ? lead.alto + ' cm' : '-'],
    ['Ancho boca', lead.boca ? lead.boca + ' cm' : '-'],
    ['Tiene foto', lead.foto || '-'],
    ['Adicionales', lead.adicionales || '-'],
    ['Medidas pend.', lead.medidasPend || '-'],
  ];

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center"
      onClick={closeLeadModal}
    >
      <div
        className="bg-white rounded-xl px-8 py-7 max-w-[500px] w-[90%] shadow-[0_20px_60px_rgba(0,0,0,0.3)] text-[#2a2a2a] relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-3 right-4 bg-transparent border-none text-2xl text-[#999] cursor-pointer px-2 py-1 leading-none hover:text-[#333]"
          onClick={closeLeadModal}
        >
          &times;
        </button>

        <h2 className="text-xl font-black text-[#2a2a2a] mb-4">{lead.nombre}</h2>

        {rows.map(([label, value], i) => (
          <div key={i} className="flex py-2 border-b border-[#f0f0f0] text-sm">
            <span className="w-[140px] text-[#888] font-semibold uppercase text-[11px] tracking-wide pt-0.5 shrink-0">
              {label}
            </span>
            <span className="flex-1 text-[#2a2a2a] font-medium">
              {value}
            </span>
          </div>
        ))}

        <BudgetHistorySection clienteKey={budgetKey} />

        <div className="flex gap-2.5 mt-5">
          {waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 px-4 rounded-md border-none cursor-pointer text-sm font-bold font-inherit text-center no-underline text-white bg-[#25D366] hover:bg-[#1ebe57] transition-colors"
            >
              WhatsApp
            </a>
          )}
          <button
            className="flex-1 py-3 px-4 rounded-md border-none cursor-pointer text-sm font-bold font-inherit text-center text-white bg-[#1DA1F2] hover:bg-[#0d8de0] transition-colors"
            onClick={() => {
              requestGeneratePresup(lead);
            }}
          >
            Generar presupuesto
          </button>
        </div>

        <MessageTemplatesSection lead={lead} />
        <NotesSection lead={lead} />
      </div>
    </div>
  );
}
