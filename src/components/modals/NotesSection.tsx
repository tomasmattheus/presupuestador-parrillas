import { useState, useMemo, useContext } from 'react';
import { useNotas } from '../../hooks/useNotas';
import { ModalContext } from '../../contexts/ModalContext';
import type { Lead } from '../../types';

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
  lead: Lead;
}

export default function NotesSection({ lead }: Props) {
  const [text, setText] = useState('');
  const { getNotesForContact, addNote, deleteNote } = useNotas();
  const { showToast, showConfirm } = useContext(ModalContext);

  const noteKey = (lead.nombre || '') + '|' + String(lead.whatsapp || '');

  const notes = useMemo(
    () => getNotesForContact(noteKey).slice().sort((a, b) => {
      return b.rowIndex - a.rowIndex;
    }),
    [getNotesForContact, noteKey]
  );

  const handleAdd = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const now = new Date();
    const pad = (n: number) => (n < 10 ? '0' + n : '' + n);
    const dateStr = pad(now.getDate()) + '-' + pad(now.getMonth() + 1) + '-' + now.getFullYear() + ' ' + pad(now.getHours()) + ':' + pad(now.getMinutes());
    const user = sessionStorage.getItem('qd_user') || 'admin';
    addNote({
      cliente: lead.nombre || '',
      telefono: String(lead.whatsapp || ''),
      fecha: dateStr,
      usuario: user,
      texto: trimmed,
    });
    setText('');
    showToast('Nota guardada', 'success');
  };

  const handleDelete = (rowIndex: number) => {
    showConfirm('Eliminar nota', 'Seguro que queres eliminar esta nota?', () => {
      deleteNote(rowIndex);
      showToast('Nota eliminada', 'success');
    });
  };

  return (
    <div className="mt-5 border-t border-[#eee] pt-4">
      <div className="text-xs font-bold uppercase tracking-wider text-[#1DA1F2] mb-3">
        Notas y actividad
      </div>
      <div className="flex gap-2 mb-3.5">
        <textarea
          className="flex-1 border border-[#ddd] rounded-md px-3 py-2 text-[13px] font-inherit resize-none h-[60px] outline-none focus:border-[#1DA1F2]"
          placeholder="Agregar nota..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          className="bg-[#1DA1F2] text-white border-none rounded-md px-4 py-2 text-[13px] font-semibold cursor-pointer font-inherit self-end"
          onClick={handleAdd}
        >
          Guardar
        </button>
      </div>
      {notes.map((note) => (
        <div key={note.rowIndex} className="py-2.5 border-b border-[#f5f5f5] relative last:border-b-0">
          <button
            className="absolute top-2.5 right-0 bg-transparent border-none text-[#ddd] text-sm cursor-pointer px-1 hover:text-red-500"
            onClick={() => handleDelete(note.rowIndex)}
            title="Eliminar"
          >
            &times;
          </button>
          <div className="text-[11px] text-[#999] mb-1">
            {formatNotaDate(note.fecha)} &mdash; {note.usuario}
          </div>
          <div className="text-[13px] text-[#2a2a2a] leading-relaxed pr-6">
            {note.texto}
          </div>
        </div>
      ))}
    </div>
  );
}
