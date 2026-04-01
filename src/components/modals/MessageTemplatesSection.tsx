import { useState, useEffect } from 'react';
import { getMessageTemplates } from '../../services/settings.service';
import type { Lead, MessageTemplate } from '../../types';

interface Props {
  lead: Lead;
}

export default function MessageTemplatesSection({ lead }: Props) {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  useEffect(() => {
    setTemplates(getMessageTemplates());
  }, []);

  const handleCopy = (idx: number) => {
    const tpl = templates[idx];
    if (!tpl) return;
    const fullText = tpl.text.replace(/\[nombre\]/g, lead.nombre || '');
    navigator.clipboard.writeText(fullText).then(() => {
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1500);
    });
  };

  if (templates.length === 0) return null;

  return (
    <div className="mt-4 border-t border-[#eee] pt-3.5">
      <div className="text-xs font-bold uppercase tracking-wider text-[#25D366] mb-2.5">
        Mensajes rapidos
      </div>
      {templates.map((tpl, idx) => {
        const preview = tpl.text.replace(/\[nombre\]/g, lead.nombre || '');
        return (
          <div
            key={idx}
            className="flex items-center gap-2.5 px-3 py-2 bg-[#f9f9f9] rounded-md mb-1.5"
          >
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-semibold text-[#888] uppercase tracking-wide">
                {tpl.name}
              </div>
              <div className="text-xs text-[#444] whitespace-nowrap overflow-hidden text-ellipsis mt-0.5">
                {preview}
              </div>
            </div>
            <button
              className={`border-none rounded px-3 py-1.5 text-[11px] font-semibold cursor-pointer font-inherit whitespace-nowrap text-white transition-colors duration-150 ${
                copiedIdx === idx ? 'bg-[#888]' : 'bg-[#25D366] hover:bg-[#1ebe57]'
              }`}
              onClick={() => handleCopy(idx)}
            >
              {copiedIdx === idx ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
        );
      })}
    </div>
  );
}
