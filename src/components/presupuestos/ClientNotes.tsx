import { useMemo, useState, useContext } from 'react';
import { useNotas } from '../../hooks/useNotas';
import { ModalContext } from '../../contexts/ModalContext';

function formatNotaDate(raw: string): string {
  if (!raw) return '';
  const d = new Date(raw);
  if (!isNaN(d.getTime())) {
    const pad = (n: number) => (n < 10 ? '0' + n : '' + n);
    return pad(d.getDate()) + '-' + pad(d.getMonth() + 1) + '-' + d.getFullYear() + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }
  return raw;
}

function last10(raw: string): string {
  return String(raw || '').replace(/\D/g, '').slice(-10);
}

interface Props {
  clienteName: string;
  clienteWhatsapp: string;
  leadSelected: boolean;
}

export default function ClientNotes({ clienteName, clienteWhatsapp, leadSelected }: Props) {
  const { allNotas, deleteNote } = useNotas();
  const { showConfirm, showToast } = useContext(ModalContext);
  const [open, setOpen] = useState(true);

  const notes = useMemo(() => {
    if (!leadSelected) return [];
    const name = (clienteName || '').trim().toLowerCase();
    if (!name) return [];
    const phone = last10(clienteWhatsapp);
    return allNotas.filter((n) => {
      if ((n.cliente || '').trim().toLowerCase() !== name) return false;
      const nPhone = last10(n.telefono);
      if (phone && nPhone) return nPhone === phone;
      return true;
    }).sort((a, b) => b.rowIndex - a.rowIndex);
  }, [allNotas, clienteName, clienteWhatsapp, leadSelected]);

  const handleDelete = (rowIndex: number) => {
    showConfirm('Eliminar nota', 'Seguro que queres eliminar esta nota?', () => {
      deleteNote(rowIndex);
      showToast('Nota eliminada', 'success');
    });
  };

  if (!leadSelected || !clienteName.trim() || notes.length === 0) return null;

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
            <div key={note.rowIndex} className="bg-white/60 rounded px-2.5 py-1.5 relative group">
              <button
                className="absolute top-1 right-1 bg-transparent border-none text-[#ccc] text-sm cursor-pointer px-1 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                onClick={() => handleDelete(note.rowIndex)}
                title="Eliminar nota"
              >
                &times;
              </button>
              <div className="text-[10px] text-[#999]">{formatNotaDate(note.fecha)} — {note.usuario}</div>
              <div className="text-[12px] text-[#2a2a2a] leading-snug pr-4">{note.texto}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
