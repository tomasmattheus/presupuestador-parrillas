import { useMemo, useState } from 'react';
import { useNotas } from '../../hooks/useNotas';

function formatNotaDate(raw: string): string {
  if (!raw) return '';
  const d = new Date(raw);
  if (!isNaN(d.getTime())) {
    const pad = (n: number) => (n < 10 ? '0' + n : '' + n);
    return pad(d.getDate()) + '-' + pad(d.getMonth() + 1) + '-' + d.getFullYear() + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }
  return raw;
}

interface Props {
  clienteName: string;
  clienteWhatsapp: string;
}

export default function ClientNotes({ clienteName, clienteWhatsapp }: Props) {
  const { allNotas } = useNotas();
  const [open, setOpen] = useState(true);

  const notes = useMemo(() => {
    const name = (clienteName || '').trim().toLowerCase();
    if (!name) return [];
    const phone = String(clienteWhatsapp || '').replace(/\D/g, '').slice(-10);
    return allNotas.filter((n) => {
      if ((n.cliente || '').trim().toLowerCase() !== name) return false;
      if (!phone) return true;
      const nPhone = String(n.telefono || '').replace(/\D/g, '').slice(-10);
      return !nPhone || nPhone === phone;
    }).sort((a, b) => b.rowIndex - a.rowIndex);
  }, [allNotas, clienteName, clienteWhatsapp]);

  if (!clienteName.trim() || notes.length === 0) return null;

  return (
    <div className="mt-3 mb-1 bg-[#fffbeb] border border-[#fcd34d]/40 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2 bg-transparent border-none cursor-pointer text-left"
      >
        <span className="text-[13px]">&#128221;</span>
        <span className="text-[12px] font-bold text-[#92400e] uppercase tracking-wide flex-1">
          Notas del cliente ({notes.length})
        </span>
        <span className={`text-[10px] text-[#d97706] transition-transform ${open ? 'rotate-180' : ''}`}>&#9660;</span>
      </button>
      {open && (
        <div className="px-3 pb-2.5 flex flex-col gap-1.5 max-h-[150px] overflow-y-auto">
          {notes.map((note) => (
            <div key={note.rowIndex} className="bg-white/60 rounded px-2.5 py-1.5">
              <div className="text-[10px] text-[#999]">{formatNotaDate(note.fecha)} — {note.usuario}</div>
              <div className="text-[12px] text-[#2a2a2a] leading-snug">{note.texto}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
