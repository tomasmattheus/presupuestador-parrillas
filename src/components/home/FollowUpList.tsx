import { useMemo, useContext } from 'react';
import type { Lead } from '../../types';
import { parseGoogleDate } from '../../lib/dates';
import { ModalContext } from '../../contexts/ModalContext';

interface Props {
  leads: Lead[];
}

export default function FollowUpList({ leads }: Props) {
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

  if (pending.length === 0) return null;

  return (
    <div className="bg-white rounded-[10px] shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-5 mb-5">
      <div className="flex items-center gap-2.5 mb-3">
        <span className="text-xl">&#128197;</span>
        <span className="text-[15px] font-bold text-[#2a2a2a]">Seguimientos pendientes</span>
        <span className="bg-[#fee2e2] text-[#dc2626] text-xs font-bold px-2 py-0.5 rounded-full">{pending.length}</span>
      </div>
      <div className="flex flex-col gap-1">
        {pending.map(({ lead, daysOverdue }) => (
          <div
            key={lead.rowIndex}
            onClick={() => openLeadModal(lead)}
            className="flex items-center gap-3 py-2.5 px-3 rounded-lg cursor-pointer hover:bg-[#f5f7fa] transition-colors"
          >
            <span className={`w-2 h-2 rounded-full shrink-0 ${daysOverdue > 0 ? 'bg-[#dc2626]' : 'bg-[#1DA1F2]'}`} />
            <span className="flex-1 text-sm font-semibold text-[#2a2a2a]">{lead.nombre}</span>
            <span className="text-[11px] font-semibold text-[#888] uppercase">{lead.stage}</span>
            <span className={`text-xs font-bold ${daysOverdue > 0 ? 'text-[#dc2626]' : 'text-[#1DA1F2]'}`}>
              {daysOverdue === 0 ? 'Hoy' : daysOverdue + 'd atraso'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
