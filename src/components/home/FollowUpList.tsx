import { useMemo, useContext } from 'react';
import type { Lead } from '../../types';
import { parseGoogleDate } from '../../lib/dates';
import { ModalContext } from '../../contexts/ModalContext';

interface Props {
  leads: Lead[];
  loading?: boolean;
}

export default function FollowUpList({ leads, loading }: Props) {
  const { openLeadModal } = useContext(ModalContext);

  const pending = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayMs = today.getTime();

    return leads
      .filter((l) => {
        if (!l.seguimiento) return false;
        if (l.stage === 'Cerrado Ganado' || l.stage === 'Cerrado Perdido') return false;
        const d = parseGoogleDate(l.seguimiento);
        if (!d || isNaN(d.getTime())) return false;
        d.setHours(0, 0, 0, 0);
        return d.getTime() <= todayMs;
      })
      .map((l) => {
        const d = parseGoogleDate(l.seguimiento)!;
        d.setHours(0, 0, 0, 0);
        const today2 = new Date();
        today2.setHours(0, 0, 0, 0);
        const diff = Math.round((today2.getTime() - d.getTime()) / 86400000);
        return { lead: l, daysOverdue: diff };
      })
      .sort((a, b) => b.daysOverdue - a.daysOverdue);
  }, [leads]);

  const waLink = (lead: Lead) => {
    const num = lead.whatsapp ? String(lead.whatsapp).replace(/\D/g, '') : '';
    return num ? 'https://wa.me/' + num : '';
  };

  return (
    <>
      <div className="flex items-center justify-between px-[18px] py-3.5 border-b border-[#f0f0f0] shrink-0">
        <h3 className="text-sm font-bold text-[#2a2a2a] tracking-wide">Seguimientos</h3>
        {pending.length > 0 && (
          <span className="text-[11px] text-white bg-[#ef4444] px-2.5 py-0.5 rounded-[10px] font-bold">
            {pending.length}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {pending.length === 0 && (
          <div className="py-10 text-center text-[#ccc] text-[13px]">
            {loading ? 'Cargando...' : 'Sin seguimientos pendientes'}
          </div>
        )}
        {pending.map(({ lead, daysOverdue }) => (
          <div
            key={lead.rowIndex}
            className="flex items-center gap-3 px-[18px] py-3 border-b border-[#f7f7f7] last:border-b-0 hover:bg-[#fafafa] transition-colors cursor-pointer"
            onClick={() => openLeadModal(lead)}
          >
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${daysOverdue > 0 ? 'bg-[#ef4444]' : 'bg-[#3b82f6]'}`} />
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-bold text-[#2a2a2a] truncate">{lead.nombre}</div>
              <div className="text-[10px] text-[#999] uppercase font-semibold">{lead.stage}</div>
            </div>
            <span className={`text-[11px] font-bold shrink-0 ${daysOverdue > 0 ? 'text-[#ef4444]' : 'text-[#3b82f6]'}`}>
              {daysOverdue === 0 ? 'Hoy' : `${daysOverdue}d atraso`}
            </span>
            {waLink(lead) && (
              <a
                href={waLink(lead)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="shrink-0 bg-[#25D366] text-white text-[10px] font-bold px-2 py-1 rounded no-underline hover:bg-[#1ebe57] transition-colors"
              >
                WA
              </a>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
